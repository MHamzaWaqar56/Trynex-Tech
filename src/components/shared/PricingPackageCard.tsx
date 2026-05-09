"use client";

import Link from 'next/link';
import type { ServicePackage } from '@/types';
import { ArrowRight, Check } from 'lucide-react';
import { formatCurrencyValue } from '@/lib/currency';
import { useCurrency, useUsdToPkrRate } from '@/components/shared/currency-store';

type Props = {
  plan: ServicePackage;
  accentClass: string;
  badgeLabel?: string;
  actionHref?: string;
  actionLabel?: string;
  primary?: boolean;
};

export default function PricingPackageCard({
  plan,
  accentClass,
  badgeLabel,
  actionHref = '/contact',
  actionLabel = 'Get Quote',
  primary = false,
}: Props) {
  const currency = useCurrency();
  const usdToPkrRate = useUsdToPkrRate();
  const priceText = formatCurrencyValue(plan.price, currency, usdToPkrRate);

  return (
    <div className={`group relative rounded-2xl p-8 border transition-all duration-300 shadow-[0_2px_16px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,212,255,0.12)] ${primary ? 'border-primary/30 bg-primary/5' : 'border-transparent bg-white'} min-[768px]:max-[1000px]:p-[1rem]`}>
      {plan.highlighted && badgeLabel && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-white text-xs font-bold px-4 py-1 rounded-full min-[768px]:max-[900px]:text-[9px]">{badgeLabel}</span>
        </div>
      )}
      <h3 className="font-display font-bold text-xl mb-1 text-gray-900">{plan.name}</h3>
      <p className="text-gray-900 text-sm mb-6">{plan.description}</p>
      <div className="flex items-end gap-1 mb-6">
        <span className={`text-4xl font-display font-bold ${primary ? 'text-primary' : 'text-gray-900'} min-[767px]:max-[1023px]:text-[1.5rem] min-[1024px]:max-[1085px]:text-[2rem]`}>{priceText}</span>
        <span className="!text-gray-900 text-sm mb-1">{plan.period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {(plan.features || []).map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-900">
            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${accentClass}`} />
            {feature}
          </li>
        ))}
      </ul>
      <Link href={actionHref} className={plan.highlighted ? 'btn-primary w-full justify-center' : 'btn-secondary hover:bg-[#0ac] hover:text-white w-full justify-center'}>
        {actionLabel} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
