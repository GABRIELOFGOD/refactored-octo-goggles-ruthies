import en from '@/i18n/en.json';

export type Language = 'en' | 'fr';
export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR';

const englishTranslations: Record<string, string> = {};
const frenchTranslations: Record<string, string> = {};

const flattenTranslations = (
  value: Record<string, unknown>,
  prefix = '',
  output: Record<string, string> = {}
): Record<string, string> => {
  for (const [key, entry] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof entry === 'string') {
      output[fullKey] = entry;
    } else if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      flattenTranslations(entry as Record<string, unknown>, fullKey, output);
    }
  }
  return output;
};

Object.assign(englishTranslations, flattenTranslations(en));

export const getEnglishTranslationEntries = (): Array<[string, string]> =>
  Object.entries(englishTranslations);

export const setDynamicTranslations = (
  language: Language,
  translations: Record<string, string>
): void => {
  if (language === 'fr') {
    Object.assign(frenchTranslations, translations);
  }
};

export const getTranslation = (lang: Language, key: string): string => {
  if (lang === 'fr' && frenchTranslations[key]) {
    return frenchTranslations[key];
  }
  return englishTranslations[key] ?? key;
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
