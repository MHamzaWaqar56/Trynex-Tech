'use client';

import { useEffect, useState } from 'react';
import {
  Users, FolderOpen, TrendingUp, Clock,
  Save, RefreshCw, BarChart2, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// ─── Types ────────────────────────────────────────────────────────────────────

type StatsData = {
  happyClients: number;
  projectsCompleted: number;
  clientRetention: number;
  foundedYear: number;
  yearsExperience: number;
  updatedAt: string | null;
};

type FormState = {
  happyClients: string;
  projectsCompleted: string;
  clientRetention: string;
  foundedYear: string;
};

// ─── Stat input card ──────────────────────────────────────────────────────────

function StatCard({
  icon, label, description, value, onChange, min, max, suffix,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  const parsed = Number(value);
  const isValid = Number.isFinite(parsed) && parsed >= (min ?? 0) && (max === undefined || parsed <= max);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>

      <div className="relative">
        <Input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`pr-12 ${!isValid && value ? 'border-red-300 focus:border-red-400' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-sm font-medium select-none">
            {suffix}
          </span>
        )}
      </div>

      {!isValid && value && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="w-3 h-3" />
          {max !== undefined ? `Must be between ${min ?? 0} and ${max}` : `Must be ≥ ${min ?? 0}`}
        </p>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StatsTab() {
  const [data, setData]     = useState<StatsData | null>(null);
  const [form, setForm]     = useState<FormState>({ happyClients: '', projectsCompleted: '', clientRetention: '', foundedYear: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  // ── Load
  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) { toast.error('Could not load stats.'); return; }
      const d: StatsData = await res.json();
      setData(d);
      setForm({
        happyClients:      String(d.happyClients),
        projectsCompleted: String(d.projectsCompleted),
        clientRetention:   String(d.clientRetention),
        foundedYear:       String(d.foundedYear),
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  // ── Validate all
  const currentYear = new Date().getFullYear();
  const isValid = (
    Number.isFinite(Number(form.happyClients))      && Number(form.happyClients)      >= 0 &&
    Number.isFinite(Number(form.projectsCompleted)) && Number(form.projectsCompleted) >= 0 &&
    Number.isFinite(Number(form.clientRetention))   && Number(form.clientRetention)   >= 0 && Number(form.clientRetention) <= 100 &&
    Number.isFinite(Number(form.foundedYear))       && Number(form.foundedYear)       >= 2000 && Number(form.foundedYear) <= currentYear
  );

  const previewYears = Number.isFinite(Number(form.foundedYear))
    ? currentYear - Number(form.foundedYear)
    : null;

  // ── Save
  async function handleSave() {
    if (!isValid) { toast.error('Please fix the errors before saving.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          happyClients:      Number(form.happyClients),
          projectsCompleted: Number(form.projectsCompleted),
          clientRetention:   Number(form.clientRetention),
          foundedYear:       Number(form.foundedYear),
        }),
      });
      if (!res.ok) { toast.error('Save failed.'); return; }
      const d: StatsData = await res.json();
      setData(d);
      toast.success('Stats updated! Changes are live on the website.');
    } finally {
      setSaving(false);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="p-5 space-y-5">

      {/* ── Header ── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" />
                Site Stats
              </CardTitle>
              <CardDescription className="mt-1 text-gray-600 text-justify">
                Manage the numbers shown on the homepage stats section. Years experience auto-calculates from your founded year.
              </CardDescription>
            </div>
            <Button type="button" variant="ghost" size="sm"
              onClick={load} disabled={loading} className="gap-1.5 self-start sm:self-auto">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-slate-400 text-sm">
          <span className="w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
          Loading stats...
        </div>
      ) : (
        <>
          {/* ── Stat input cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              icon={<Users className="w-4 h-4" />}
              label="Happy Clients"
              description="Shown with '+' suffix on site"
              value={form.happyClients}
              onChange={(v) => setForm({ ...form, happyClients: v })}
              min={0}
              suffix="+"
            />
            <StatCard
              icon={<FolderOpen className="w-4 h-4" />}
              label="Projects Completed"
              description="Shown with '+' suffix on site"
              value={form.projectsCompleted}
              onChange={(v) => setForm({ ...form, projectsCompleted: v })}
              min={0}
              suffix="+"
            />
            <StatCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="Client Retention"
              description="Percentage — max 100"
              value={form.clientRetention}
              onChange={(v) => setForm({ ...form, clientRetention: v })}
              min={0}
              max={100}
              suffix="%"
            />

            {/* Founded year — special card with live preview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Founded Year</p>
                  <p className="text-xs text-gray-600">Years experience = {currentYear} − founded year</p>
                </div>
              </div>

              <Input
                type="number"
                min={2000}
                max={currentYear}
                value={form.foundedYear}
                onChange={(e) => setForm({ ...form, foundedYear: e.target.value })}
              />

              {/* Live years preview */}
              {previewYears !== null && previewYears >= 0 ? (
                <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                  <span className="text-xs text-gray-900">Years Experience shown on site:</span>
                  <span className="text-2xl font-bold text-primary tabular-nums">
                    {previewYears}
                    <span className="text-sm font-normal text-gray-900 ml-1">yr</span>
                  </span>
                </div>
              ) : (
                <p className="flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle className="w-3 h-3" /> Must be between 2000 and {currentYear}
                </p>
              )}
            </div>
          </div>

          {/* ── Live preview strip ── */}
          <Card className="border-slate-200 bg-slate-50/50">
            <CardContent className="!p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] font-mono text-gray-900 mb-4">
                Live Preview — as shown on website
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Projects Completed', value: form.projectsCompleted, suffix: '+' },
                  { label: 'Happy Clients',      value: form.happyClients,      suffix: '+' },
                  { label: 'Years Experience',   value: String(previewYears ?? '—'), suffix: ' yr' },
                  { label: 'Client Retention',   value: form.clientRetention,   suffix: '%' },
                ].map(({ label, value, suffix }) => (
                  <div key={label} className="text-center rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-3xl font-bold text-primary tabular-nums">
                      {Number.isFinite(Number(value)) ? Number(value) : value}{suffix}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── Last updated + save ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {data?.updatedAt ? (
              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                Last saved: {new Date(data.updatedAt).toLocaleString()}
              </p>
            ) : (
              <p className="text-xs text-gray-600">Never saved</p>
            )}

            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || !isValid}
              className="gap-2 min-w-[160px] justify-center"
            >
              {saving
                ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                : <><Save className="w-4 h-4" /> Save Stats</>
              }
            </Button>
          </div>
        </>
      )}
    </div>
  );
}