/**
 * Geolocation utility for detecting user's country and currency
 * Uses IP-based geolocation API for non-authenticated users
 */

interface GeolocationData {
  country: string;
  countryCode: string;
  timezone: string;
  currency: string;
  language: string;
}

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  // Africa
  NG: 'NGN', // Nigeria
  GH: 'GHS', // Ghana
  KE: 'KES', // Kenya
  ZA: 'ZAR', // South Africa
  EG: 'EGP', // Egypt
  
  // Americas
  US: 'USD', // United States
  CA: 'CAD', // Canada
  MX: 'MXN', // Mexico
  BR: 'BRL', // Brazil
  
  // Europe
  GB: 'GBP', // United Kingdom
  DE: 'EUR', // Germany (Eurozone)
  FR: 'EUR', // France
  IT: 'EUR', // Italy
  ES: 'EUR', // Spain
  NL: 'EUR', // Netherlands
  BE: 'EUR', // Belgium
  
  // Asia
  JP: 'JPY', // Japan
  CN: 'CNY', // China
  IN: 'INR', // India
  SG: 'SGD', // Singapore
  AU: 'AUD', // Australia
};

const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  // French-speaking countries
  FR: 'fr', // France
  BE: 'fr', // Belgium
  CA: 'fr', // Canada
  CH: 'fr', // Switzerland
  LU: 'fr', // Luxembourg
  SN: 'fr', // Senegal
  CI: 'fr', // Côte d'Ivoire
  CM: 'fr', // Cameroon
  CG: 'fr', // Congo
  GA: 'fr', // Gabon
  ML: 'fr', // Mali
  BJ: 'fr', // Benin
  TG: 'fr', // Togo
  BF: 'fr', // Burkina Faso
  NE: 'fr', // Niger
  
  // English-speaking countries (default to 'en')
  // Most others default to English
};

/**
 * Fetch geolocation data based on client IP
 * Falls back to default (Nigeria/NGN/English) if API fails
 */
export async function getGeolocation(): Promise<GeolocationData> {
  try {
    // Using ip-api.com free tier (non-commercial)
    // Alternative: Use Cloudflare's IP geolocation header if available
    const response = await fetch('https://ip-api.com/json/?fields=country,countryCode', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Geolocation API request failed');
    }

    const data = await response.json();
    const countryCode = data.countryCode as string;
    const country = data.country as string;

    // Get currency for country
    const currency = COUNTRY_CURRENCY_MAP[countryCode] || 'NGN';

    // Get language for country
    const language = COUNTRY_LANGUAGE_MAP[countryCode] || 'en';

    return {
      country,
      countryCode,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency,
      language,
    };
  } catch (error) {
    console.error('Geolocation fetch failed, using defaults:', error);
    
    // Default to Nigeria/NGN/English
    return {
      country: 'Nigeria',
      countryCode: 'NG',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: 'NGN',
      language: 'en',
    };
  }
}

/**
 * Cache geolocation data in localStorage
 * Cache for 24 hours to avoid repeated API calls
 */
export function cacheGeolocation(data: GeolocationData): void {
  const cacheData = {
    data,
    timestamp: Date.now(),
  };
  localStorage.setItem('geolocationCache', JSON.stringify(cacheData));
}

/**
 * Get cached geolocation data if still valid (< 24 hours old)
 */
export function getCachedGeolocation(): GeolocationData | null {
  try {
    const cached = localStorage.getItem('geolocationCache');
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    const cacheAge = now - timestamp;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (cacheAge < twentyFourHours) {
      return data;
    }

    localStorage.removeItem('geolocationCache');
    return null;
  } catch (error) {
    console.error('Error reading geolocation cache:', error);
    return null;
  }
}

/**
 * Get geolocation with caching support
 */
export async function getGeolocationWithCache(): Promise<GeolocationData> {
  // Check cache first
  const cached = getCachedGeolocation();
  if (cached) {
    return cached;
  }

  // Fetch fresh data
  const data = await getGeolocation();
  
  // Cache it
  cacheGeolocation(data);

  return data;
}
