'use client';

import type { FormEvent } from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Trash2, Pencil, ArrowLeft,
  Users, Star, ImagePlus, Send,
  Facebook, Mail, Linkedin, Github,
  User, FileText, Hash,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TeamMember {
  _id: string;
  name: string;
  designation: string;
  coverText: string;
  image: string;
  facebook?: string;
  email?: string;
  linkedin?: string;
  github?: string;
  order?: number;
}

interface DeleteDialogState {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}

interface Props {
  members: TeamMember[];
  onDelete: (dialog: DeleteDialogState) => void;
  onRefresh: () => Promise<void>;
  editingId?: string | null;
  onCancelEdit?: () => void;
  onGoToList: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeOrder(v: number) {
  const n = Math.trunc(Number(v) || 1);
  return n > 0 ? n : 1;
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

// ─── Form defaults ────────────────────────────────────────────────────────────

type TeamForm = {
  name: string;
  designation: string;
  coverText: string;
  image: string;
  facebook: string;
  email: string;
  linkedin: string;
  github: string;
  order: number;
};

const emptyForm: TeamForm = {
  name: '', designation: '', coverText: '', image: '',
  facebook: '', email: '', linkedin: '', github: '', order: 1,
};

function normalizeForm(m: TeamMember): TeamForm {
  return {
    name:        m.name,
    designation: m.designation,
    coverText:   m.coverText,
    image:       m.image,
    facebook:    m.facebook  || '',
    email:       m.email     || '',
    linkedin:    m.linkedin  || '',
    github:      m.github    || '',
    order:       normalizeOrder(m.order || 1),
  };
}

// ─── Social link helper ───────────────────────────────────────────────────────

function SocialRow({ icon, value, placeholder, onChange }: {
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex-shrink-0 text-slate-400">{icon}</span>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="flex-1" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

type View = 'list' | 'editor';

export default function TeamTab({
  members,
  onDelete,
  onRefresh,
  editingId,
  onCancelEdit,
  onGoToList,
}: Props) {

  const [view, setView]           = useState<View>(editingId ? 'editor' : 'list');
  const [form, setForm]           = useState<TeamForm>(emptyForm);
  const [localId, setLocalId]     = useState<string | null>(editingId ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [busy, setBusy]           = useState(false);

  // Sync external editingId
  useEffect(() => {
    if (editingId) {
      const m = members.find((mb) => mb._id === editingId);
      if (m) openEditor(m);
    }
  }, [editingId]);

  const duplicateOrder = useMemo(() =>
    members.some((m) => m._id !== localId && normalizeOrder(m.order || 1) === normalizeOrder(form.order)),
    [members, localId, form.order],
  );

  // ── Helpers
  function openEditor(m: TeamMember) {
    setForm(normalizeForm(m));
    setLocalId(m._id);
    setImageFile(null);
    setView('editor');
  }

  function resetForm() {
    setForm(emptyForm);
    setLocalId(null);
    setImageFile(null);
  }

  function handleCancel() {
    resetForm();
    onCancelEdit?.();
    setView('list');
  }

  // ── Image preview src
  const previewSrc = imageFile
    ? URL.createObjectURL(imageFile)
    : form.image || null;

  // ── Submit
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.name || form.name.length < 2) { toast.error('Name must be at least 2 characters.'); return; }
    if (!form.designation || form.designation.length < 2) { toast.error('Designation must be at least 2 characters.'); return; }
    if (!form.coverText || form.coverText.length < 10) { toast.error('Bio must be at least 10 characters.'); return; }
    if (!form.image && !imageFile) { toast.error('Profile image is required.'); return; }
    if (duplicateOrder) { toast.error('This order number already exists.'); return; }

    setBusy(true);
    try {
      const image = imageFile
        ? await uploadToCloudinary(imageFile, 'team')
        : form.image;

      const payload = { ...form, image, order: normalizeOrder(form.order) };

      const res = localId
        ? await fetch(`/api/admin/team/${localId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/admin/team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

      if (res.ok) {
        toast.success(localId ? 'Team member updated!' : 'Team member added!');
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
  function handleDelete(m: TeamMember) {
    onDelete({
      title: 'Delete team member?',
      description: `This will permanently remove "${m.name}" from the about page.`,
      confirmLabel: 'Delete Member',
      onConfirm: async () => {
        const res = await fetch(`/api/admin/team/${m._id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Team member deleted.');
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
            <Users className="w-4 h-4" />
            <span><span className="font-semibold text-gray-900">{members.length}</span> members</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onGoToList} className="text-xs">Team Page</Button>
            <Button size="sm" onClick={() => { resetForm(); setView('editor'); }} className="text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add Member
            </Button>
          </div>
        </div>

        {/* Cards grid */}
        {members.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-gray-900">
            <Users className="w-8 h-8 opacity-30" />
            <span className="text-sm">No team members yet.</span>
            <Button size="sm" variant="ghost" onClick={() => setView('editor')} className="mt-1 text-xs gap-1">
              <Plus className="w-3 h-3" /> Add first member
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 pb-4">
            {[...members]
              .sort((a, b) => (a.order || 1) - (b.order || 1))
              .map((m) => (
                <div
                  key={m._id}
                  className="rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Avatar */}
                  <div className="relative h-44 bg-gray-100 overflow-hidden">
                    {m.image ? (
                      <img src={m.image} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-14 h-14 text-gray-900" />
                      </div>
                    )}
                    {/* Order badge */}
                    <span className="absolute top-2 left-2 inline-flex items-center rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white font-mono">
                      #{m.order ?? 1}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-1">
                    <p className="font-semibold text-gray-900 truncate">{m.name}</p>
                    <p className="text-xs text-primary truncate">{m.designation}</p>
                    <p className="text-[11px] text-gray-900 line-clamp-2 leading-relaxed">{m.coverText}</p>

                    {/* Social links */}
                    <div className="flex items-center gap-2 pt-1">
                      {m.email    && <Mail     className="w-3.5 h-3.5 text-gray-600" />}
                      {m.linkedin && <Linkedin className="w-3.5 h-3.5 text-gray-600" />}
                      {m.github   && <Github   className="w-3.5 h-3.5 text-gray-600" />}
                      {m.facebook && <Facebook className="w-3.5 h-3.5 text-gray-600" />}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 border-t border-slate-100 p-2">
                    <Button type="button" size="sm" variant="ghost"
                      className="flex-1 h-8 text-xs  gap-1"
                      onClick={() => openEditor(m)}>
                      <Pencil className="w-3 h-3" /> Edit
                    </Button>
                    <Button type="button" size="sm" variant="destructive"
                      className="flex-1 h-8 text-xs gap-1"
                      onClick={() => handleDelete(m)}>
                      <Trash2 className="w-3 h-3" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
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
              <CardTitle>{localId ? 'Edit Team Member' : 'New Team Member'}</CardTitle>
              <CardDescription className="mt-1">Add profile details that appear on the about page.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="default" size="sm" onClick={() => setView('list')} className="gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" /> All Members
              </Button>
              {localId && (
                <Button type="button" variant="ghost" size="sm" onClick={handleCancel} className="text-xs">Cancel</Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">

            {/* Name + Designation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3" /> Full Name *
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ahmed Khan"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Designation *</label>
                <Input
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  placeholder="e.g. Lead Developer"
                  required
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3 h-3" /> Bio / Cover Text *
              </label>
              <Textarea
                value={form.coverText}
                onChange={(e) => setForm({ ...form, coverText: e.target.value })}
                placeholder="Short bio shown on the about page..."
                rows={4}
                className="resize-none"
              />
              <p className="text-[11px] text-slate-400">Minimum 10 characters.</p>
            </div>

            {/* Profile image */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                <ImagePlus className="w-3 h-3" /> Profile Image *
              </label>

              {/* Preview */}
              {previewSrc && (
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-primary-200 shadow-sm">
                  <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" />
                  {imageFile && (
                    <button
                      type="button"
                      onClick={() => setImageFile(null)}
                      className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors text-[10px]"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white file:font-semibold file:text-sm file:cursor-pointer cursor-pointer"
              />
              <p className="text-[11px] text-gray-900">
                {localId ? 'Pick a new file only if you want to replace the current photo.' : 'Required for new members.'}
              </p>
            </div>

            {/* Social links */}
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-medium text-gray-900 uppercase tracking-wider">Social Links</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SocialRow icon={<Mail     className="w-4 h-4 text-gray-900" />} value={form.email}    placeholder="Email address"   onChange={(v) => setForm({ ...form, email: v })}    />
                <SocialRow icon={<Linkedin className="w-4 h-4 text-gray-900" />} value={form.linkedin} placeholder="LinkedIn URL"    onChange={(v) => setForm({ ...form, linkedin: v })} />
                <SocialRow icon={<Github   className="w-4 h-4 text-gray-900" />} value={form.github}   placeholder="GitHub URL"      onChange={(v) => setForm({ ...form, github: v })}   />
                <SocialRow icon={<Facebook className="w-4 h-4 text-gray-900" />} value={form.facebook} placeholder="Facebook URL"    onChange={(v) => setForm({ ...form, facebook: v })} />
              </div>
            </div>

            {/* Display order */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                <Hash className="w-3 h-3" /> Display Order
              </label>
              <Input
                type="number" min={1} step={1}
                value={String(form.order)}
                onChange={(e) => setForm({ ...form, order: normalizeOrder(e.currentTarget.valueAsNumber) })}
                placeholder="1"
                className="max-w-[120px]"
              />
              {duplicateOrder && <p className="text-xs text-red-400">This order number already exists.</p>}
            </div>

            {/* Submit */}
            <Button type="submit" disabled={busy} className="w-full justify-center py-3 gap-2">
              {busy
                ? <Spinner size="sm" variant="dark" />
                : <><Send className="w-4 h-4" /> {localId ? 'Update Member' : 'Add Member'}</>
              }
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}