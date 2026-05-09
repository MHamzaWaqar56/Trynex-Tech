"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import {
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
  type CurrencyCode,
  detectPreferredCurrency,
} from '@/lib/currency';

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    setCurrencyState(detectPreferredCurrency());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  }, [currency]);

  const setCurrency = (nextCurrency: CurrencyCode) => {
    setCurrencyState(nextCurrency);
  };

  return <CurrencyContext.Provider value={{ currency, setCurrency }}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: DEFAULT_CURRENCY,
      setCurrency: () => {},
    };
  }

  return context;
}
