'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getEnglishTranslationEntries,
  Language,
  setDynamicTranslations,
} from '@/lib/i18n';
import { useAuth } from '@/provider/auth-provider';
import { getGeolocationWithCache } from '@/lib/geolocation';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const isLanguage = (value: unknown): value is Language =>
  value === 'en' || value === 'fr';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [, setTranslationRevision] = useState(0);

  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const initializeLanguage = async () => {
      try {
        if (isLanguage(user?.preferredLanguage)) {
          setLanguageState(user.preferredLanguage);
          return;
        }

        const savedLanguage = localStorage.getItem('language');
        if (isLanguage(savedLanguage)) {
          setLanguageState(savedLanguage);
          return;
        }

        if (!user) {
          try {
            const geoData = await getGeolocationWithCache();
            const geoLanguage = geoData.language === 'fr' ? 'fr' : 'en';
            if (!cancelled) {
              setLanguageState(geoLanguage);
              localStorage.setItem('language', geoLanguage);
            }
            return;
          } catch (error) {
            console.error('Geolocation detection failed:', error);
          }
        }

        const browserLanguage = navigator.language.split('-')[0];
        const detectedLanguage = browserLanguage === 'fr' ? 'fr' : 'en';
        if (!cancelled) {
          setLanguageState(detectedLanguage);
          localStorage.setItem('language', detectedLanguage);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void initializeLanguage();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (language === 'en') return;

    let cancelled = false;
    const entries = getEnglishTranslationEntries();

    const loadTranslations = async () => {
      try {
        const translations: string[] = [];
        for (let index = 0; index < entries.length; index += 100) {
          const batch = entries.slice(index, index + 100);
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              target: language,
              texts: batch.map(([, text]) => text),
            }),
          });

          if (!response.ok) {
            throw new Error(`Translation service returned ${response.status}`);
          }

          const result: { translations: string[] } = await response.json();
          if (
            !Array.isArray(result.translations) ||
            result.translations.length !== batch.length ||
            result.translations.some((translation) => typeof translation !== 'string')
          ) {
            throw new Error('Translation service returned an invalid response');
          }
          translations.push(...result.translations);
        }

        if (!cancelled) {
          setDynamicTranslations(
            language,
            Object.fromEntries(
              entries.map(([key], index) => [key, translations[index]])
            )
          );
          setTranslationRevision((revision) => revision + 1);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load dynamic translations:', error);
        }
      }
    };

    void loadTranslations();
    return () => {
      cancelled = true;
    };
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // Also update user profile if logged in
    if (user) {
      updateUserLanguagePreference(lang);
    } else {
      localStorage.setItem('language', lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language: isLoading ? 'en' : language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// Helper function to update user language preference in profile
const updateUserLanguagePreference = async (language: Language) => {
  try {
    localStorage.setItem('language', language);
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ preferredLanguage: language }),
    });

    if (!response.ok) {
      console.error('Failed to update language preference');
    }
  } catch (error) {
    console.error('Error updating language preference:', error);
  }
};
