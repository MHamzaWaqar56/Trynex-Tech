import { useEffect, useSyncExternalStore } from 'react';
import {
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
  DEFAULT_USD_TO_PKR_RATE,
  type CurrencyCode,
  detectPreferredCurrency,
} from '@/lib/currency';

const listeners = new Set<() => void>();
let currentCurrency: CurrencyCode = DEFAULT_CURRENCY;
let currentUsdToPkrRate = DEFAULT_USD_TO_PKR_RATE;
let exchangeRateBootstrapped = false;
let exchangeRateBootstrapPromise: Promise<void> | null = null;

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCurrency() {
  return currentCurrency;
}

export function setCurrency(nextCurrency: CurrencyCode) {
  currentCurrency = nextCurrency;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, nextCurrency);
  }

  notifyListeners();
}

export function getUsdToPkrRate() {
  return currentUsdToPkrRate;
}

export function setUsdToPkrRate(nextRate: number) {
  if (!Number.isFinite(nextRate) || nextRate <= 0) return;

  currentUsdToPkrRate = nextRate;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem('trynex-usd-to-pkr-rate', String(nextRate));
  }

  notifyListeners();
}

async function bootstrapExchangeRate() {
  if (exchangeRateBootstrapPromise) {
    return exchangeRateBootstrapPromise;
  }

  exchangeRateBootstrapPromise = (async () => {
    if (typeof window !== 'undefined') {
      const savedRate = Number(window.localStorage.getItem('trynex-usd-to-pkr-rate'));
      if (Number.isFinite(savedRate) && savedRate > 0) {
        currentUsdToPkrRate = savedRate;
      }

      if (!exchangeRateBootstrapped) {
        const onStorage = (event: StorageEvent) => {
          if (event.key === 'trynex-usd-to-pkr-rate' && event.newValue) {
            const nextRate = Number(event.newValue);
            if (Number.isFinite(nextRate) && nextRate > 0) {
              currentUsdToPkrRate = nextRate;
              notifyListeners();
            }
          }
        };

        window.addEventListener('storage', onStorage);
        exchangeRateBootstrapped = true;
      }
    }

    try {
      const response = await fetch('/api/currency-rate', { cache: 'no-store' });
      if (!response.ok) return;

      const data = await response.json();
      const nextRate = Number(data?.rate);
      if (Number.isFinite(nextRate) && nextRate > 0) {
        currentUsdToPkrRate = nextRate;

        if (typeof window !== 'undefined') {
          window.localStorage.setItem('trynex-usd-to-pkr-rate', String(nextRate));
        }

        notifyListeners();
      }
    } catch {
      // Keep the saved or default rate if the fetch fails.
    }
  })();

  return exchangeRateBootstrapPromise;
}

function syncCurrencyFromBrowser() {
  if (typeof window === 'undefined') return;

  const preferredCurrency = detectPreferredCurrency();
  if (preferredCurrency !== currentCurrency) {
    currentCurrency = preferredCurrency;
    notifyListeners();
  }
}

export function useCurrency() {
  const currency = useSyncExternalStore(subscribe, getCurrency, () => DEFAULT_CURRENCY);

  useEffect(() => {
    syncCurrencyFromBrowser();
  }, []);

  return currency;
}

export function useUsdToPkrRate() {
  const rate = useSyncExternalStore(subscribe, getUsdToPkrRate, () => DEFAULT_USD_TO_PKR_RATE);

  useEffect(() => {
    void bootstrapExchangeRate();
  }, []);

  return rate;
}
