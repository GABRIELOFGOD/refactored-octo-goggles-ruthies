'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Currency } from '@/lib/i18n';
import { useAuth } from '@/provider/auth-provider';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('NGN');
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsClient(true);
    const savedCurrency = user?.preferredCurrency || localStorage.getItem('currency') as Currency || "USD";
    if (savedCurrency && ['NGN', 'USD', 'GBP', 'EUR'].includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    } else {
      setCurrencyState('NGN');
      localStorage.setItem('currency', 'NGN');
    }
  }, []);

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('currency', curr);
    // Also update user profile if logged in
    if (user) {
      updateUserCurrencyPreference(curr);
    } else {
      localStorage.setItem('currency', curr);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency: isClient ? currency : 'NGN', setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

// Helper function to update user currency preference in profile
const updateUserCurrencyPreference = async (currency: Currency) => {
  try {
    localStorage.setItem('currency', currency);
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ preferredCurrency: currency }),
    });

    if (!response.ok) {
      console.error('Failed to update currency preference');
    }
  } catch (error) {
    console.error('Error updating currency preference:', error);
  }
};
