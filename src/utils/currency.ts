export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  flag?: string;
  nativeSymbol?: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka (BDT)', flag: '🇧🇩', nativeSymbol: '৳' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)', flag: '🇺🇸', nativeSymbol: '$' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', flag: '🇪🇺', nativeSymbol: '€' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', flag: '🇬🇧', nativeSymbol: '£' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', flag: '🇮🇳', nativeSymbol: '₹' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal (SAR)', flag: '🇸🇦', nativeSymbol: 'ر.س' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham (AED)', flag: '🇦🇪', nativeSymbol: 'د.إ' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit (MYR)', flag: '🇲🇾', nativeSymbol: 'RM' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (SGD)', flag: '🇸🇬', nativeSymbol: 'S$' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)', flag: '🇨🇦', nativeSymbol: 'CA$' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar (AUD)', flag: '🇦🇺', nativeSymbol: 'AU$' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)', flag: '🇯🇵', nativeSymbol: '¥' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan (CNY)', flag: '🇨🇳', nativeSymbol: '¥' },
  { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar (KWD)', flag: '🇰🇼', nativeSymbol: 'د.ك' },
  { code: 'QAR', symbol: 'QR', name: 'Qatari Riyal (QAR)', flag: '🇶🇦', nativeSymbol: 'ر.ق' },
  { code: 'OMR', symbol: 'OMR', name: 'Omani Rial (OMR)', flag: '🇴🇲', nativeSymbol: 'ر.ع.' },
  { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar (BHD)', flag: '🇧🇭', nativeSymbol: '.د.ب' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee (PKR)', flag: '🇵🇰', nativeSymbol: '₨' },
  { code: 'NPR', symbol: 'रू', name: 'Nepalese Rupee (NPR)', flag: '🇳🇵', nativeSymbol: 'रू' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee (LKR)', flag: '🇱🇰', nativeSymbol: 'Rs' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht (THB)', flag: '🇹🇭', nativeSymbol: '฿' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah (IDR)', flag: '🇮🇩', nativeSymbol: 'Rp' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira (TRY)', flag: '🇹🇷', nativeSymbol: '₺' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble (RUB)', flag: '🇷🇺', nativeSymbol: '₽' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won (KRW)', flag: '🇰🇷', nativeSymbol: '₩' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)', flag: '🇨🇭', nativeSymbol: 'CHF' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real (BRL)', flag: '🇧🇷', nativeSymbol: 'R$' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand (ZAR)', flag: '🇿🇦', nativeSymbol: 'R' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (NGN)', flag: '🇳🇬', nativeSymbol: '₦' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound (EGP)', flag: '🇪🇬', nativeSymbol: 'ج.م' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso (PHP)', flag: '🇵🇭', nativeSymbol: '₱' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong (VND)', flag: '🇻🇳', nativeSymbol: '₫' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar (NZD)', flag: '🇳🇿', nativeSymbol: 'NZ$' }
];

export const CURRENCY_SYMBOL_MAP: Record<string, string> = SUPPORTED_CURRENCIES.reduce(
  (acc, curr) => {
    acc[curr.code.toUpperCase()] = curr.symbol;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Returns the default symbol for a given currency code.
 * If not found in the predefined list, it falls back to common patterns or the provided fallback.
 */
export function getAutoCurrencySymbol(currencyCode: string, fallback: string = '৳'): string {
  if (!currencyCode) return fallback;
  const upper = currencyCode.trim().toUpperCase();
  return CURRENCY_SYMBOL_MAP[upper] || fallback;
}
