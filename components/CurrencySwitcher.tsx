'use client';

import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import { t, currencyConfig } from '@/lib/i18n';
import { DollarSign } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export const CurrencySwitcher = () => {
  const { currency, setCurrency } = useCurrency();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currencies = [
    { code: 'NGN' as const, symbol: '₦' },
    { code: 'USD' as const, symbol: '$' },
    { code: 'GBP' as const, symbol: '£' },
    { code: 'EUR' as const, symbol: '€' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-700"
        title={t(language, 'header.currency')}
      >
        <DollarSign className="w-4 h-4" />
        <span className="text-sm font-medium hidden my-auto sm:inline">{currency}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <p className="text-xs font-semibold text-neutral-600 px-3 py-2">
              {t(language, 'header.currency')}
            </p>
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => {
                  setCurrency(curr.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                  currency === curr.code
                    ? 'bg-secondary text-white font-medium'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span>
                  {curr.code} ({curr.symbol})
                </span>
                {currency === curr.code && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
