'use client';

import { useEffect, useState } from 'react';
import {
  DollarSign, Save, RefreshCw,
  TrendingUp, Clock, ArrowRightLeft,
  CheckCircle2, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { setUsdToPkrRate } from '@/components/shared/currency-store';

// ─── Types ────────────────────────────────────────────────────────────────────

type CurrencyRateResponse = {
  rate: number;
  updatedAt: string | null;
};

// ─── Quick preview helper ─────────────────────────────────────────────────────

const PREVIEW_AMOUNTS = [1, 10, 50, 100, 500];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CurrencyTab() {
  const [rate, setRate]           = useState('');
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  // ── Load current rate on mount
  async function loadRate() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/currency-rate');
      if (!res.ok) { toast.error('Could not load currency rate.'); return; }
      const data = (await res.json()) as CurrencyRateResponse;
      setCurrentRate(data.rate);
      setRate(String(data.rate));
      setUpdatedAt(data.updatedAt);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadRate(); }, []);

  // ── Save updated rate
  async function saveRate() {
    const parsed = Number(rate);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error('Please enter a valid USD to PKR rate.');
      return;
    }
    if (parsed === currentRate) {
      toast('Rate is already set to this value.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/currency-rate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usdToPkrRate: parsed }),
      });
      if (!res.ok) { toast.error('Currency rate update failed.'); return; }
      const data = (await res.json()) as CurrencyRateResponse;
      setCurrentRate(data.rate);
      setRate(String(data.rate));
      setUpdatedAt(data.updatedAt);
      setUsdToPkrRate(data.rate);
      toast.success('Currency rate updated successfully!');
    } finally {
      setSaving(false);
    }
  }

  // ── Derived values
  const parsed       = Number(rate);
  const isValid      = Number.isFinite(parsed) && parsed > 0;
  const hasChanged   = isValid && parsed !== currentRate;
  const lastUpdated  = updatedAt ? new Date(updatedAt).toLocaleString() : 'Never';
  const daysSince    = updatedAt
    ? Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="p-5 space-y-5">

      {/* ── Header Card ── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Currency Settings
              </CardTitle>
              <CardDescription className="mt-1">
                Update the USD → PKR rate used across pricing cards, quotations, and conversion badges.
              </CardDescription>
            </div>
            <Button
              type="button" variant="ghost" size="sm"
              onClick={loadRate} disabled={loading}
              className="gap-1.5 self-start lg:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">

        {/* ── Left: Input panel ── */}
        <Card>
          <CardContent className="!p-6 space-y-5">

            {/* Section label */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-gray-900 font-mono">Manual Control</p>
              <h3 className="mt-1.5 text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-primary" />
                Set Live Exchange Rate
              </h3>
            </div>

            {/* Input + Save */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">
                USD to PKR Rate
              </label>
              <div className="flex gap-3 items-end">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-900 font-semibold text-sm select-none">
                    ₨
                  </span>
                  <Input
                    type="number"
                    min={0.01}
                    step="0.01"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="280.00"
                    className="pl-8"
                    disabled={loading}
                  />
                </div>
                <Button
                  type="button"
                  onClick={saveRate}
                  disabled={saving || loading || !isValid}
                  className="gap-1.5 whitespace-nowrap"
                >
                  {saving
                    ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    : <><Save className="w-4 h-4" /> Save Rate</>
                  }
                </Button>
              </div>

              {/* Validation feedback */}
              {rate && !isValid && (
                <p className="flex items-center gap-1.5 text-xs text-red-400">
                  <AlertCircle className="w-3.5 h-3.5" /> Please enter a valid positive number.
                </p>
              )}
              {hasChanged && isValid && (
                <p className="flex items-center gap-1.5 text-xs text-primary">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Rate will change from <strong>{currentRate}</strong> → <strong>{parsed}</strong>
                </p>
              )}
              {!hasChanged && isValid && currentRate !== null && (
                <p className="flex items-center gap-1.5 text-xs text-green-500">
                  <CheckCircle2 className="w-3.5 h-3.5" /> This is the current live rate.
                </p>
              )}
            </div>

            {/* Conversion preview table */}
            {isValid && (
              <div className="rounded-2xl border border-primary-200 overflow-hidden">
                <div className="bg-primary-50 px-4 py-2.5 border-b border-primary-200">
                  <p className="text-[11px] uppercase tracking-[0.18em] font-mono text-gray-900">Conversion Preview</p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary-200">
                      <th className="text-left px-4 py-2.5 text-xs text-gray-600 font-medium">USD</th>
                      <th className="text-right px-4 py-2.5 text-xs text-gray-600 font-medium">PKR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-200">
                    {PREVIEW_AMOUNTS.map((usd) => (
                      <tr key={usd} className="hover:bg-primary-100 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-gray-900">${usd}</td>
                        <td className="px-4 py-2.5 text-right text-gray-900">
                          ₨ {(usd * parsed).toLocaleString('en-PK', { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </CardContent>
        </Card>

        {/* ── Right: Stats panel ── */}
        <div className="space-y-4">

          {/* Current rate big display */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="!p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-gray-900 font-mono">Current Rate</p>
              {loading ? (
                <div className="mt-3 flex items-center gap-2 text-gray-900">
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                  Loading...
                </div>
              ) : (
                <>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-4xl font-bold text-gray-900 tracking-tight">
                      {currentRate ?? '—'}
                    </span>
                    <span className="pb-1 text-sm text-gray-600">PKR / 1 USD</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    This value is used across the site wherever pricing is converted.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Last updated */}
          <Card>
            <CardContent className="!p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-gray-900 font-mono flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Last Updated
              </p>
              <p className="mt-2 text-sm font-medium text-gray-900">{lastUpdated}</p>
              {daysSince !== null && (
                <p className={`mt-1 text-xs ${daysSince > 7 ? 'text-primary' : 'text-gray-600'}`}>
                  {daysSince === 0
                    ? 'Updated today'
                    : daysSince === 1
                    ? '1 day ago'
                    : `${daysSince} days ago`}
                  {daysSince > 7 && ' — consider updating'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Info card */}
          <Card className="border-primary-200 bg-primary-50/50">
            <CardContent className="!p-5 space-y-2">
              <p className="text-[11px] uppercase tracking-[0.22em] text-gray-900 font-mono">Where it&apos;s used</p>
              {[
                'Service pricing cards',
                'Quotation calculator',
                'Currency conversion badges',
                'Lead & consultation forms',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-gray-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}