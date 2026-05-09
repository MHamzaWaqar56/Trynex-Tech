'use client';

import type { FormEvent } from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Trash2, Pencil, ArrowLeft,
  FolderOpen, Star, ImagePlus, BarChart2,
  Layers, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PortfolioProject {
  _id: string;
  title: string;
  slug: string;
  client: string;
  service: string;
  description: string;
  results?: Array<{ label: string; value: string }>;
  tech?: string[];
  images?: string[];
  featured?: boolean;
  order?: number;
}

interface DeleteDialogState {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}

interface Props {
  projects: PortfolioProject[];
  onDelete: (dialog: DeleteDialogState) => void;
  onRefresh: () => Promise<void>;
  editingSlug?: string | null;
  onCancelEdit?: () => void;
  onGoToList: () => void;
}

// ─── Local helpers ────────────────────────────────────────────────────────────

type ResultRow = { label: string; value: string };
type ImageSlot = { id: string; file: File | null; preview: string | null };

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function listToArray(value: string) {
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function uniqueList(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeOrder(value: number) {
  const n = Math.trunc(Number(value) || 1);
  return n > 0 ? n : 1;
}

function formatFileName(url: string) {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || url;
  } catch {
    return url;
  }
}

function readPreview(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result || ''));
    r.onerror = () => rej(new Error('Read failed'));
    r.readAsDataURL(file);
  });
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

async function uploadMultiple(files: File[], folder: string): Promise<string[]> {
  const urls: string[] = [];
  for (const f of files) urls.push(await uploadToCloudinary(f, folder));
  return urls;
}

// ─── Form defaults ────────────────────────────────────────────────────────────

const emptyForm = {
  title: '', client: '', service: '', description: '',
  tech: '', images: '', featured: false, order: 1,
};

function normalizeForm(p: PortfolioProject) {
  return {
    title:       p.title,
    client:      p.client,
    service:     p.service,
    description: p.description,
    tech:        (p.tech    || []).join(', '),
    images:      (p.images  || []).join(', '),
    featured:    Boolean(p.featured),
    order:       normalizeOrder(p.order || 1),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

type View = 'list' | 'editor';

export default function PortfolioTab({
  projects,
  onDelete,
  onRefresh,
  editingSlug,
  onCancelEdit,
  onGoToList,
}: Props) {

  const [view, setView]                       = useState<View>(editingSlug ? 'editor' : 'list');
  const [form, setForm]                       = useState(emptyForm);
  const [localSlug, setLocalSlug]             = useState<string | null>(editingSlug ?? null);
  const [results, setResults]                 = useState<ResultRow[]>([{ label: '', value: '' }]);
  const [imageSlots, setImageSlots]           = useState<ImageSlot[]>([{ id: uid(), file: null, preview: null }]);
  const [busy, setBusy]                       = useState(false);

  // sync external editingSlug
  useEffect(() => {
    if (editingSlug) {
      const p = projects.find((pr) => pr.slug === editingSlug);
      if (p) openEditor(p);
    }
  }, [editingSlug]);

  // existing image URLs from form.images field
  const existingImages = useMemo(() => listToArray(form.images), [form.images]);

  // new files staged in slots
  const newFiles = useMemo(
    () => imageSlots.map((s) => s.file).filter((f): f is File => Boolean(f)),
    [imageSlots],
  );

  // duplicate order check
  const duplicateOrder = useMemo(() => {
    return projects.some(
      (p) => p.slug !== localSlug && normalizeOrder(p.order || 1) === normalizeOrder(form.order),
    );
  }, [projects, localSlug, form.order]);

  // ── Open editor with a project
  function openEditor(p: PortfolioProject) {
    setForm(normalizeForm(p));
    setLocalSlug(p.slug);
    setResults(p.results?.length ? p.results.map((r) => ({ ...r })) : [{ label: '', value: '' }]);
    setImageSlots([{ id: uid(), file: null, preview: null }]);
    setView('editor');
  }

  // ── Reset form
  function resetForm() {
    setForm(emptyForm);
    setLocalSlug(null);
    setResults([{ label: '', value: '' }]);
    setImageSlots([{ id: uid(), file: null, preview: null }]);
  }

  function handleCancel() {
    resetForm();
    onCancelEdit?.();
    setView('list');
  }

  // ── Image slot management
  async function addFileToSlot(slotId: string, file: File) {
    const preview = await readPreview(file);
    setImageSlots((cur) => {
      const next = cur.map((s) => s.id === slotId ? { ...s, file, preview } : s);
      // if this was the last slot, push a new empty one
      const target = next.find((s) => s.id === slotId);
      if (target === next[next.length - 1]) next.push({ id: uid(), file: null, preview: null });
      if (!next.some((s) => !s.file)) next.push({ id: uid(), file: null, preview: null });
      return next;
    });
  }

  function removeSlot(slotId: string) {
    setImageSlots((cur) => {
      const next = cur.filter((s) => s.id !== slotId);
      if (next.length === 0) return [{ id: uid(), file: null, preview: null }];
      if (next.every((s) => s.file)) next.push({ id: uid(), file: null, preview: null });
      return next;
    });
  }

  function removeExistingImage(url: string) {
    setForm((f) => ({
      ...f,
      images: listToArray(f.images).filter((u) => u !== url).join(', '),
    }));
  }

  // ── Submit
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    if (duplicateOrder) { toast.error('This order number already exists.'); return; }

    setBusy(true);
    try {
      const uploadedUrls = newFiles.length > 0 ? await uploadMultiple(newFiles, 'portfolio') : [];

      const payload = {
        title:       form.title,
        client:      form.client,
        service:     form.service,
        description: form.description,
        results:     results.map((r) => ({ label: r.label.trim(), value: r.value.trim() })).filter((r) => r.label && r.value),
        tech:        listToArray(form.tech),
        images:      uniqueList([...existingImages, ...uploadedUrls]),
        featured:    form.featured,
        order:       normalizeOrder(form.order),
      };

      const res = localSlug
        ? await fetch(`/api/portfolio/${localSlug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

      if (res.ok) {
        toast.success(localSlug ? 'Project updated!' : 'Project added!');
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
  function handleDelete(p: PortfolioProject) {
    onDelete({
      title: 'Delete portfolio project?',
      description: `This will permanently remove "${p.title}" from your portfolio.`,
      confirmLabel: 'Delete Project',
      onConfirm: async () => {
        const res = await fetch(`/api/portfolio/${p.slug}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Project deleted.');
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
            <FolderOpen className="w-4 h-4" />
            <span><span className="font-semibold text-gray-900">{projects.length}</span> projects</span>
            {projects.filter((p) => p.featured).length > 0 && (
              <>
                <span className="text-gray-600">·</span>
                <span className="text-primary font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" /> {projects.filter((p) => p.featured).length} featured
                </span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onGoToList} className="text-xs">
              Portfolio Page
            </Button>
            <Button size="sm" onClick={() => { resetForm(); setView('editor'); }} className="text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New Project
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-sm">
            <thead>
              <tr className="border-b border-primary-100">
                {['Project', 'Client', 'Service', 'Tech', 'Order', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3.5 text-gray-900 font-mono text-xs uppercase tracking-[0.18em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-900">
                      <FolderOpen className="w-8 h-8 opacity-30" />
                      <span className="text-sm">No projects yet.</span>
                      <Button size="sm" variant="default" onClick={() => setView('editor')} className="mt-1 text-xs gap-1">
                        <Plus className="w-3 h-3" /> Add first project
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                [...projects].sort((a, b) => (a.order || 1) - (b.order || 1)).map((p) => (
                  <tr key={p._id} className="align-middle hover:bg-primary-100 transition-colors">

                    {/* Title + featured */}
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <div className="flex items-center gap-1.5">
                        {p.featured && <Star className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                        <span className="font-medium text-gray-900 truncate">{p.title}</span>
                      </div>
                      {p.images && p.images.length > 0 && (
                        <span className="text-[11px] text-gray-600">{p.images.length} image{p.images.length !== 1 ? 's' : ''}</span>
                      )}
                    </td>

                    {/* Client */}
                    <td className="px-4 py-3.5 text-gray-900 text-xs whitespace-nowrap">{p.client || '—'}</td>

                    {/* Service */}
                    <td className="px-4 py-3.5">
                      <Badge variant="outline" className="max-w-[160px] truncate rounded-full  px-3 py-1 text-xs text-gray-900">
                        {p.service || '—'}
                      </Badge>
                    </td>

                    {/* Tech */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {p.tech?.slice(0, 3).map((t) => (
                          <span key={t} className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-gray-600">
                            {t}
                          </span>
                        ))}
                        {(p.tech?.length ?? 0) > 3 && (
                          <span className="text-[11px] text-gray-600">+{(p.tech?.length ?? 0) - 3}</span>
                        )}
                        {(!p.tech || p.tech.length === 0) && <span className="text-[11px] text-gray-600">—</span>}
                      </div>
                    </td>

                    {/* Order */}
                    <td className="px-4 py-3.5 text-gray-900 text-xs text-center">{p.order ?? 1}</td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Button type="button" size="sm" variant="ghost"
                          className="h-8 w-8 !p-0 justify-center "
                          onClick={() => openEditor(p)} aria-label="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button type="button" size="sm" variant="destructive"
                          className="h-8 w-8 !p-0 justify-center"
                          onClick={() => handleDelete(p)} aria-label="Delete">
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
              <CardTitle>{localSlug ? 'Edit Portfolio Project' : 'New Portfolio Project'}</CardTitle>
              <CardDescription className="mt-1">Create or update a portfolio item.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="default" size="sm" onClick={() => setView('list')} className="gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" /> All Projects
              </Button>
              {localSlug && (
                <Button type="button" variant="ghost" size="sm" onClick={handleCancel} className="text-xs">
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">

            {/* Title / Client / Service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Title *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Project title" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Client</label>
                <Input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Client name" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Service</label>
              <Input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} placeholder="e.g. Web Development" />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Project overview..." rows={4} className="resize-none" />
            </div>

            {/* Tech stack */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3" /> Tech Stack
                <span className="normal-case font-normal text-gray-600 ml-1">(comma separated)</span>
              </label>
              <Input value={form.tech} onChange={(e) => setForm({ ...form, tech: e.target.value })} placeholder="React, Next.js, Tailwind" />
            </div>

            {/* Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Display Order</label>
              <Input
                type="number" min={1} step={1}
                value={String(form.order)}
                onChange={(e) => setForm({ ...form, order: normalizeOrder(e.currentTarget.valueAsNumber) })}
                placeholder="1"
                className="max-w-[120px]"
              />
              {duplicateOrder && (
                <p className="text-xs text-red-400">This order number already exists.</p>
              )}
            </div>

            {/* ── Result metrics ── */}
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-primary" /> Project Results
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">Add measurable outcomes. Both fields required per row.</p>
                </div>
                <Button type="button" variant="ghost" size="sm" className="text-xs gap-1"
                  onClick={() => setResults((r) => [...r, { label: '', value: '' }])}>
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </Button>
              </div>
              <div className="space-y-3">
                {results.map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center rounded-xl border border-primary-200 bg-white p-3">
                    <Input
                      value={row.label}
                      onChange={(e) => setResults((r) => r.map((item, idx) => idx === i ? { ...item, label: e.target.value } : item))}
                      placeholder="Label (e.g. Revenue Growth)"
                    />
                    <Input
                      value={row.value}
                      onChange={(e) => setResults((r) => r.map((item, idx) => idx === i ? { ...item, value: e.target.value } : item))}
                      placeholder="Value (e.g. +120%)"
                    />
                    <Button type="button" size="sm" variant="destructive"
                      className="h-8 w-8 p-0 justify-center "
                      onClick={() => setResults((r) => { const n = r.filter((_, idx) => idx !== i); return n.length > 0 ? n : [{ label: '', value: '' }]; })}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── New images ── */}
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                    <ImagePlus className="w-4 h-4 text-primary" /> New Images
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">Select multiple images — strip grows as you add more.</p>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {imageSlots.map((slot, idx) => (
                  <div key={slot.id} className="relative flex-shrink-0 w-[190px] rounded-2xl border border-primary-200 bg-white p-3">
                    {slot.file && slot.preview ? (
                      <>
                        <div className="relative overflow-hidden rounded-xl border border-primary-200 h-[160px]">
                          <img src={slot.preview} alt={slot.file.name} className="h-full w-full object-cover" />
                          <button type="button" onClick={() => removeSlot(slot.id)}
                            className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="mt-2 truncate text-[11px] text-slate-500" title={slot.file.name}>{slot.file.name}</p>
                      </>
                    ) : (
                      <div className="flex flex-col h-[160px] items-center justify-center rounded-xl border-2 border-dashed border-primary-200 bg-white/50 px-3 gap-2 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Plus className="h-5 w-5" />
                        </div>
                        <p className="text-xs text-slate-500">
                          {idx === imageSlots.length - 1 ? 'Add image' : 'Empty slot'}
                        </p>
                        <Input
                          type="file" accept="image/*" multiple
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={(e) => {
                            const files = Array.from(e.currentTarget.files || []);
                            e.currentTarget.value = '';
                            files.forEach((file) => {
                              setImageSlots((cur) => {
                                const empty = cur.find((s) => !s.file);
                                if (empty) { void addFileToSlot(empty.id, file); return cur; }
                                const newSlot: ImageSlot = { id: uid(), file: null, preview: null };
                                void addFileToSlot(newSlot.id, file);
                                return [...cur, newSlot];
                              });
                            });
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600">Images upload to Cloudinary on save.</p>
            </div>

            {/* ── Existing images (edit mode) ── */}
            {localSlug && existingImages.length > 0 && (
              <div className="space-y-3 rounded-2xl border border-primary-200 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-900">Existing Images</p>
                  <p className="text-xs text-gray-600">Remove any before saving.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {existingImages.map((url) => (
                    <div key={url} className="rounded-xl border border-primary-200 bg-white p-3 space-y-2">
                      <img src={url} alt="Existing" className="h-28 w-full rounded-lg object-cover border border-primary-100" />
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-gray-900 truncate" title={url}>{formatFileName(url)}</p>
                        <Button type="button" size="sm" variant="destructive"
                          className=" h-7 px-2 text-xs gap-1"
                          onClick={() => removeExistingImage(url)}>
                          <Trash2 className="w-3 h-3" /> Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured toggle */}
            <label className="flex items-center gap-2.5 text-sm text-gray-900 cursor-pointer select-none">
              <input type="checkbox" checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 accent-primary" />
              <Star className="w-4 h-4 text-" /> Featured project
            </label>

            {/* Submit */}
            <Button type="submit" disabled={busy} className="w-full justify-center py-3 gap-2">
              {busy
                ? <Spinner size="sm" variant="dark" />
                : <><Plus className="w-4 h-4" /> {localSlug ? 'Update Project' : 'Add Project'}</>
              }
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}