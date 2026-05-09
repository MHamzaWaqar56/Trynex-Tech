export type CurrencyCode = 'USD' | 'PKR';

export const DEFAULT_CURRENCY: CurrencyCode = 'PKR';
export const CURRENCY_STORAGE_KEY = 'trynex-currency';
export const DEFAULT_USD_TO_PKR_RATE = 280;

function normalizeCurrencyCode(value: string | null | undefined): CurrencyCode | null {
  if (!value) return null;
  const normalized = value.toUpperCase();
  if (normalized === 'USD' || normalized === 'PKR') return normalized;
  return null;
}

function formatWholeAmount(amount: number, currency: CurrencyCode) {
  return new Intl.NumberFormat(currency === 'PKR' ? 'en-PK' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function detectPreferredCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;

  const savedCurrency = normalizeCurrencyCode(window.localStorage.getItem(CURRENCY_STORAGE_KEY));
  if (savedCurrency) return savedCurrency;

  const locale = (window.navigator.language || '').toLowerCase();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone?.toLowerCase() || '';

  if (locale.includes('pk') || locale.startsWith('ur') || timeZone.includes('karachi')) {
    return 'PKR';
  }

  return DEFAULT_CURRENCY;
}

export function convertAmount(amount: number, from: CurrencyCode, to: CurrencyCode, usdToPkrRate = DEFAULT_USD_TO_PKR_RATE) {
  if (from === to) return amount;
  return from === 'USD' ? amount * usdToPkrRate : amount / usdToPkrRate;
}

function detectSourceCurrency(value: string): CurrencyCode {
  const lower = value.toLowerCase();
  if (lower.includes('pkr') || lower.includes('rs') || lower.includes('rupee')) return 'PKR';
  if (lower.includes('$') || lower.includes('usd') || lower.includes('dollar')) return 'USD';
  return 'PKR';
}

export function formatCurrencyValue(value: number | string, currency: CurrencyCode, usdToPkrRate = DEFAULT_USD_TO_PKR_RATE) {
  if (typeof value === 'number') {
    const converted = convertAmount(value, 'PKR', currency, usdToPkrRate);
    return `${currency === 'PKR' ? 'PKR' : '$'} ${formatWholeAmount(converted, currency)}`;
  }

  const raw = value.trim();
  if (!raw) return raw;

  if (/^(custom|contact us|quote|tbd|negotiable)$/i.test(raw)) {
    return raw;
  }

  const match = raw.match(/(?:PKR|Rs\.?|USD|\$)?\s*([\d,]+(?:\.\d+)?)/i);
  if (!match) return raw;

  const amount = Number.parseFloat(match[1].replace(/,/g, ''));
  if (Number.isNaN(amount)) return raw;

  const sourceCurrency = detectSourceCurrency(raw);
  const converted = convertAmount(amount, sourceCurrency, currency, usdToPkrRate);
  const formatted = `${currency === 'PKR' ? 'PKR' : '$'} ${formatWholeAmount(converted, currency)}`;

  return raw.replace(match[0], formatted);
}
