'use client';

import type { FormEvent } from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  Send, Plus, Trash2, Pencil, ArrowLeft,
  Zap, Star, Tag, List, ImagePlus,
  Package, CheckCircle2, DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ManagedService {
  _id: string;
  title: string;
  slug: string;
  coverImage: string;
  summary: string;
  bullets: string[];
  tags: string[];
  details: string;
  featured?: boolean;
  packages: Array<{
    name: string;
    price: string | number;
    period: string;
    description: string;
    features: string[];
    highlighted: boolean;
    cta?: string;
  }>;
  order?: number;
}

interface DeleteDialogState {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}

interface Props {
  services: ManagedService[];
  onDelete: (dialog: DeleteDialogState) => void;
  onRefresh: () => Promise<void>;
  editingId?: string | null;
  onCancelEdit?: () => void;
  onGoToList: () => void;
}

// ─── Local types & helpers ────────────────────────────────────────────────────

type PackageSlot = 'basic' | 'standard' | 'premium';

type PackageForm = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string;
  highlighted: boolean;
};

type ServiceForm = {
  title: string;
  coverImage: string;
  summary: string;
  bullets: string;
  tags: string;
  details: string;
  featured: boolean;
  order: number;
  basic: PackageForm;
  standard: PackageForm;
  premium: PackageForm;
};

function normalizeOrder(v: number) {
  const n = Math.trunc(Number(v) || 1);
  return n > 0 ? n : 1;
}

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function listToArray(v: string) {
  return v.split(',').map((s) => s.trim()).filter(Boolean);
}

function pkgBase(name: string, highlighted = false): PackageForm {
  return { name, price: '', period: '', description: '', features: '', highlighted };
}

const emptyForm: ServiceForm = {
  title: '', coverImage: '', summary: '', bullets: '', tags: '', details: '',
  featured: false, order: 1,
  basic: pkgBase('Basic', false),
  standard: pkgBase('Standard', true),
  premium: pkgBase('Premium', false),
};

function normalizeForm(s: ManagedService): ServiceForm {
  const pkgs = s.packages || [];
  const normPkg = (i: number, fallback: string, highlighted: boolean): PackageForm => ({
    name:        pkgs[i]?.name        || fallback,
    price:       String(pkgs[i]?.price || ''),
    period:      pkgs[i]?.period      || '',
    description: pkgs[i]?.description || '',
    features:    (pkgs[i]?.features   || []).join(', '),
    highlighted: Boolean(pkgs[i]?.highlighted ?? highlighted),
  });
  return {
    title:      s.title,
    coverImage: s.coverImage,
    summary:    s.summary,
    bullets:    (s.bullets || []).join(', '),
    tags:       (s.tags    || []).join(', '),
    details:    s.details,
    featured:   Boolean(s.featured),
    order:      normalizeOrder(s.order || 1),
    basic:      normPkg(0, 'Basic',    false),
    standard:   normPkg(1, 'Standard', true),
    premium:    normPkg(2, 'Premium',  false),
  };
}

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', folder);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  if (!res.ok) {
    const p = await res.json().catch(() => null);
    throw new Error(p?.error || 'Upload failed.');
  }
  const data = await res.json();
  const url = data?.asset?.secure_url;
  if (!url) throw new Error('Upload returned no URL.');
  return url as string;
}

// ─── Package card component ───────────────────────────────────────────────────

function PackageCard({
  slot, form, onChange,
}: {
  slot: PackageSlot;
  form: ServiceForm;
  onChange: (f: ServiceForm) => void;
}) {
  const pkg = form[slot];
  const slotLabels: Record<PackageSlot, string> = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };
  const slotColors: Record<PackageSlot, string> = {
    basic:    'border-gray-200 bg-gray-50/50',
    standard: 'border-primary/30 bg-primary/5',
    premium:  'border-yellow-200 bg-yellow-50/30',
  };
  const update = (patch: Partial<PackageForm>) =>
    onChange({ ...form, [slot]: { ...pkg, ...patch } });

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${slotColors[slot]}`}>
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-semibold text-gray-900 capitalize flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          {slotLabels[slot]} Package
        </h4>
        <label className="flex items-center gap-2 text-xs text-gray-900 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={pkg.highlighted}
            onChange={(e) => update({ highlighted: e.target.checked })}
            className="w-3.5 h-3.5 rounded accent-primary"
          />
          <Star className="w-3 h-3 text-primary" /> Highlighted
        </label>
      </div>

      <Input
        value={pkg.name}
        onChange={(e) => update({ name: e.target.value })}
        placeholder="Package name"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] text-gray-900 uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Price
          </label>
          <Input value={pkg.price} onChange={(e) => update({ price: e.target.value })} placeholder="e.g. 199" />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-gray-900 uppercase tracking-wider">Period</label>
          <Input value={pkg.period} onChange={(e) => update({ period: e.target.value })} placeholder="e.g. /month" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] text-gray-900 uppercase tracking-wider">Description</label>
        <Textarea
          value={pkg.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="What's included in this package..."
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[11px] text-gray-900 uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Features
          <span className="normal-case font-normal text-gray-600 ml-1">(comma separated)</span>
        </label>
        <Input value={pkg.features} onChange={(e) => update({ features: e.target.value })} placeholder="Feature 1, Feature 2, Feature 3" />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type View = 'list' | 'editor';

export default function ServicesTab({
  services,
  onDelete,
  onRefresh,
  editingId,
  onCancelEdit,
  onGoToList,
}: Props) {

  const [view, setView]               = useState<View>(editingId ? 'editor' : 'list');
  const [form, setForm]               = useState<ServiceForm>(emptyForm);
  const [localId, setLocalId]         = useState<string | null>(editingId ?? null);
  const [coverFile, setCoverFile]     = useState<File | null>(null);
  const [busy, setBusy]               = useState(false);

  // Sync external editingId
  useEffect(() => {
    if (editingId) {
      const s = services.find((sv) => sv._id === editingId);
      if (s) openEditor(s);
    }
  }, [editingId]);

  const duplicateOrder = useMemo(() =>
    services.some((s) => s._id !== localId && normalizeOrder(s.order || 1) === normalizeOrder(form.order)),
    [services, localId, form.order],
  );

  function openEditor(s: ManagedService) {
    setForm(normalizeForm(s));
    setLocalId(s._id);
    setCoverFile(null);
    setView('editor');
  }

  function resetForm() {
    setForm(emptyForm);
    setLocalId(null);
    setCoverFile(null);
  }

  function handleCancel() {
    resetForm();
    onCancelEdit?.();
    setView('list');
  }

  // ── Submit
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    if (duplicateOrder) { toast.error('This order number already exists.'); return; }

    setBusy(true);
    try {
      const coverImage = coverFile
        ? await uploadToCloudinary(coverFile, 'services')
        : form.coverImage;

      const payload = {
        title:    form.title,
        slug:     slugify(form.title),
        coverImage,
        summary:  form.summary,
        bullets:  listToArray(form.bullets),
        tags:     listToArray(form.tags),
        details:  form.details,
        featured: form.featured,
        order:    normalizeOrder(form.order),
        packages: (['basic', 'standard', 'premium'] as PackageSlot[]).map((slot) => ({
          name:        form[slot].name,
          price:       form[slot].price,
          period:      form[slot].period,
          description: form[slot].description,
          features:    listToArray(form[slot].features),
          highlighted: form[slot].highlighted,
        })),
      };

      const res = localId
        ? await fetch(`/api/admin/services/${localId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/admin/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

      if (res.ok) {
        toast.success(localId ? 'Service updated!' : 'Service created!');
        resetForm();
        await onRefresh();
        setView('list');
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || 'Save failed.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  // ── Delete
  function handleDelete(s: ManagedService) {
    onDelete({
      title: 'Delete service?',
      description: `This will permanently remove "${s.title}" and its packages from the public site.`,
      confirmLabel: 'Delete Service',
      onConfirm: async () => {
        const res = await fetch(`/api/admin/services/${s._id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Service deleted.');
          await onRefresh();
        } else {
          toast.error('Delete failed.');
        }
      },
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ════════════════════════════════════════════════════════════════════════════
  if (view === 'list') {
    return (
      <div className="flex flex-col gap-4">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-2 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-900">
            <Zap className="w-4 h-4" />
            <span><span className="font-semibold text-gray-900">{services.length}</span> services</span>
            {services.filter((s) => s.featured).length > 0 && (
              <>
                <span className="text-gray-900">·</span>
                <span className="text-primary font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" /> {services.filter((s) => s.featured).length} featured
                </span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onGoToList} className="text-xs">Services Page</Button>
            <Button size="sm" onClick={() => { resetForm(); setView('editor'); }} className="text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New Service
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full text-sm">
            <thead>
              <tr className="border-b border-primary-100">
                {['Service', 'Tags', 'Packages', 'Order', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3.5 text-gray-900 font-mono text-xs uppercase tracking-[0.18em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-900">
                      <Zap className="w-8 h-8 opacity-30" />
                      <span className="text-sm">No services yet.</span>
                      <Button size="sm" variant="default" onClick={() => setView('editor')} className="mt-1 text-xs gap-1">
                        <Plus className="w-3 h-3" /> Add first service
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                [...services].sort((a, b) => (a.order || 1) - (b.order || 1)).map((s) => (
                  <tr key={s._id} className="align-middle hover:bg-primary-100 transition-colors">

                    {/* Title */}
                    <td className="px-4 py-3.5 max-w-[240px]">
                      <div className="flex items-center gap-1.5">
                        {s.featured && <Star className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                        <span className="font-medium text-gray-900 truncate">{s.title}</span>
                      </div>
                      {s.summary && (
                        <p className="text-[11px] text-gray-600 truncate mt-0.5 max-w-[220px]">{s.summary}</p>
                      )}
                    </td>

                    {/* Tags */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {s.tags?.slice(0, 3).map((t) => (
                          <span key={t} className="inline-flex items-center gap-0.5 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                            <Tag className="w-2.5 h-2.5" />{t}
                          </span>
                        ))}
                        {(s.tags?.length ?? 0) > 3 && (
                          <span className="text-[11px] text-gray-600">+{(s.tags?.length ?? 0) - 3}</span>
                        )}
                        {(!s.tags || s.tags.length === 0) && <span className="text-[11px] text-gray-600">—</span>}
                      </div>
                    </td>

                    {/* Packages */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {s.packages?.map((pkg) => (
                          <span
                            key={pkg.name}
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                              pkg.highlighted
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {pkg.highlighted && <Star className="w-2.5 h-2.5 mr-1" />}
                            {pkg.name}
                            {pkg.price ? ` · $${pkg.price}` : ''}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Order */}
                    <td className="px-4 py-3.5 text-gray-900 text-xs text-center">{s.order ?? 1}</td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Button type="button" size="sm" variant="ghost"
                          className="h-8 w-8 !p-0 justify-center"
                          onClick={() => openEditor(s)} aria-label="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button type="button" size="sm" variant="destructive"
                          className="h-8 w-8 !p-0 justify-center "
                          onClick={() => handleDelete(s)} aria-label="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // EDITOR VIEW
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="p-5 min-[320px]:max-[500px]:p-[6px]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>{localId ? 'Edit Service' : 'Add New Service'}</CardTitle>
              <CardDescription className="mt-1">Create a service with 3 pricing packages.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="default" size="sm" onClick={() => setView('list')} className="gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" /> All Services
              </Button>
              {localId && (
                <Button type="button" variant="ghost" size="sm" onClick={handleCancel} className="text-xs">Cancel</Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Title *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Service title" required />
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Summary</label>
              <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Short description shown in cards..." rows={3} className="resize-none" />
            </div>

            {/* Bullets */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                <List className="w-3 h-3" /> Bullet Points
                <span className="normal-case font-normal text-gray-600 ml-1">(comma separated)</span>
              </label>
              <Textarea value={form.bullets} onChange={(e) => setForm({ ...form, bullets: e.target.value })} placeholder="Fast delivery, 24/7 support, Free revisions" rows={3} className="resize-none" />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3" /> Tags
                <span className="normal-case font-normal text-gray-600 ml-1">(comma separated)</span>
              </label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="web, design, seo" />
            </div>

            {/* Details */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Details</label>
              <Textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Full service description..." rows={6} className="resize-none" />
            </div>

            {/* Cover image */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                <ImagePlus className="w-3 h-3" /> Cover Image
              </label>
              {form.coverImage && !coverFile && (
                <div className="relative overflow-hidden rounded-xl border border-primary/30">
                  <img src={form.coverImage} alt="Current cover" className="h-40 w-full object-cover" />
                  <div className="absolute bottom-2 left-2 text-[10px] font-mono px-2 py-1 rounded-full bg-black/60 text-gray-300 border border-white/10">
                    Current Image
                  </div>
                </div>
              )}
              {coverFile && (
                <div className="relative overflow-hidden rounded-xl border border-primary/30">
                  <img src={URL.createObjectURL(coverFile)} alt="New cover" className="h-40 w-full object-cover" />
                  <div className="absolute bottom-2 left-2 text-[10px] font-mono px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/20">
                    New Image
                  </div>
                  <button
                    type="button"
                    onClick={() => setCoverFile(null)}
                    className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full bg-black/70 text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
              <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
              <p className="text-[11px] text-gray-600">Pick a new file only if you want to replace the current cover.</p>
            </div>

            {/* Featured + Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <label className="flex items-center gap-2.5 text-sm text-gray-900 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-primary/50 accent-primary"
                />
                <Star className="w-4 h-4 text-primary" /> Featured on home page
              </label>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Display Order</label>
                <Input
                  type="number" min={1} step={1}
                  value={String(form.order)}
                  onChange={(e) => setForm({ ...form, order: normalizeOrder(e.currentTarget.valueAsNumber) })}
                  placeholder="1"
                />
                {duplicateOrder && <p className="text-xs text-red-400">This order number already exists.</p>}
              </div>
            </div>

            {/* ── 3 Package cards ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-gray-900">Pricing Packages</p>
              </div>
              {(['basic', 'standard', 'premium'] as PackageSlot[]).map((slot) => (
                <PackageCard key={slot} slot={slot} form={form} onChange={setForm} />
              ))}
            </div>

            {/* Submit */}
            <Button type="submit" disabled={busy} className="w-full justify-center py-3 gap-2">
              {busy
                ? <Spinner size="sm" variant="dark" />
                : <><Send className="w-4 h-4" /> {localId ? 'Update Service' : 'Add Service'}</>
              }
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}