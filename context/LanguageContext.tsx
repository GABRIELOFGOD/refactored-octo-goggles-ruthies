'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/lib/i18n';
import { useAuth } from '@/provider/auth-provider';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isClient, setIsClient] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    setIsClient(true);
    const savedLanguage = user?.preferredLanguage || localStorage.getItem('language') as Language || "en";
    if (savedLanguage && ['en', 'fr'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      // Try to get from browser language
      const browserLang = navigator.language.split('-')[0];
      const lang = browserLang === 'fr' ? 'fr' : 'en';
      setLanguageState(lang);
      localStorage.setItem('language', lang);
    }
  }, []);

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
    <LanguageContext.Provider value={{ language: isClient ? language : 'en', setLanguage }}>
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
