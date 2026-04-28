import en from '@/i18n/en.json';
import fr from '@/i18n/fr.json';

export type Language = 'en' | 'fr';
export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR';

const translations = {
  en,
  fr,
};

export const getTranslation = (lang: Language, key: string): string => {
  const keys = key.split('.');
  let value: any = translations[lang];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  return typeof value === 'string' ? value : key;
};

export const t = (lang: Language, key: string): string => {
  return getTranslation(lang, key);
};

// Currency symbols and formats
export const currencyConfig: Record<Currency, { symbol: string; name: string; locale: string }> = {
  NGN: { symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  EUR: { symbol: '€', name: 'Euro', locale: 'en-EU' },
};

export const formatPrice = (price: number, currency: Currency): string => {
  const config = currencyConfig[currency];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
  }).format(price);
};

export const getExchangeRates = (): Record<Currency, number> => {
  // These should come from an API in production
  // For now, using approximate rates (NGN is base)
  return {
    NGN: 1,
    USD: 0.00064, // 1 NGN ≈ 0.00064 USD (approximate)
    GBP: 0.00051, // 1 NGN ≈ 0.00051 GBP (approximate)
    EUR: 0.00059, // 1 NGN ≈ 0.00059 EUR (approximate)
  };
};

export const convertCurrency = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
  if (fromCurrency === toCurrency) return amount;

  const rates = getExchangeRates();
  // Convert to NGN first, then to target currency
  const amountInNGN = amount / rates[fromCurrency];
  const amountInTarget = amountInNGN * rates[toCurrency];

  return Math.round(amountInTarget * 100) / 100;
};
