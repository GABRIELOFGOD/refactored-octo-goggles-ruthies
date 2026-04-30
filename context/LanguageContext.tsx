'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/lib/i18n';
import { useAuth } from '@/provider/auth-provider';
import { getGeolocationWithCache } from '@/lib/geolocation';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    setIsClient(true);
    initializeLanguage();
  }, [user]);

  const initializeLanguage = async () => {
    try {
      setIsLoading(true);

      // If user is logged in, use their preference
      if (user?.preferredLanguage) {
        setLanguageState(user.preferredLanguage as Language);
        return;
      }

      // Check localStorage first
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && ['en', 'fr'].includes(savedLanguage)) {
        setLanguageState(savedLanguage);
        return;
      }

      // For guests, try geolocation
      if (!user) {
        try {
          const geoData = await getGeolocationWithCache();
          const geoLang = (geoData.language === 'fr' ? 'fr' : 'en') as Language;
          setLanguageState(geoLang);
          localStorage.setItem('language', geoLang);
          return;
        } catch (error) {
          console.error('Geolocation detection failed:', error);
        }
      }

      // Try browser language as fallback
      const browserLang = navigator.language.split('-')[0];
      const lang = (browserLang === 'fr' ? 'fr' : 'en') as Language;
      setLanguageState(lang);
      localStorage.setItem('language', lang);
    } finally {
      setIsLoading(false);
    }
  };

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
    <LanguageContext.Provider value={{ language: isClient && !isLoading ? language : 'en', setLanguage }}>
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
