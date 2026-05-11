"use client";

import { type CurrencyCode } from '@/lib/currency';
import { setCurrency, useCurrency } from '@/components/shared/currency-store';

const options: { code: CurrencyCode; label: string; helper: string }[] = [
  { code: 'PKR', label: 'PKR', helper: 'Pakistan' },
  { code: 'USD', label: 'International', helper: 'USD' },
];

export default function CurrencySwitcher() {
  const currency = useCurrency();

  return (
    <div className="currency-switcher-group shadow-[0_6px_20px_rgba(0,0,0,0.08)] w-fit">
        {options.map((option) => {
          const active = currency === option.code;

          return (
            <button
              key={option.code}
              type="button"
              onClick={() => setCurrency(option.code)}
              className={`currency-switcher-option ${active ? 'currency-switcher-option-active' : 'text-gray-600'}`}
            >
              <span>{option.label}</span>
              <span className={`ml-2 text-[11px] uppercase tracking-[0.16em] ${active ? 'text-white/80' : 'text-gray-400'}`}>
                {option.helper}
              </span>
            </button>
          );
        })}
      </div>
  );
}
