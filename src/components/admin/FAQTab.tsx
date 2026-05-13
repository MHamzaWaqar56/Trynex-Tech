
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Pencil, HelpCircle, Save, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner }  from '@/components/ui/spinner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

interface DeleteDialogState {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}

interface Props {
  onDelete: (dialog: DeleteDialogState) => void;
}

// ─── Empty form ───────────────────────────────────────────────────────────────

const emptyForm = { question: '', answer: '', order: 0, isActive: true };

// ─── Component ────────────────────────────────────────────────────────────────

export default function FAQTab({ onDelete }: Props) {
  const [faqs,       setFaqs]       = useState<FAQ[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [form,       setForm]       = useState(emptyForm);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  async function loadFAQs() {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/faq');
      const data = await res.json();
      setFaqs(data.faqs ?? []);
    } catch {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadFAQs(); }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function openAdd() {
    setEditingId(null);
    setForm({ ...emptyForm, order: faqs.length });
    setShowForm(true);
  }

  function openEdit(faq: FAQ) {
    setEditingId(faq._id);
    setForm({ question: faq.question, answer: faq.answer, order: faq.order, isActive: faq.isActive });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  // ── Duplicate order check ──────────────────────────────────────────────────

  const duplicateOrder = useMemo(
    () => faqs.some((f) => f._id !== editingId && f.order === form.order),
    [faqs, editingId, form.order],
  );

  // ── Save (add / edit) ──────────────────────────────────────────────────────

  async function handleSave() {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Question and answer are required.');
      return;
    }
    if (duplicateOrder) {
      toast.error('This order number already exists.');
      return;
    }

    setSaving(true);
    try {
      const url    = editingId ? `/api/admin/faq/${editingId}` : '/api/admin/faq';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message ?? 'Failed to save FAQ');
        return;
      }

      toast.success(editingId ? 'FAQ updated.' : 'FAQ added.');
      cancelForm();
      await loadFAQs();
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  // ── Toggle active ──────────────────────────────────────────────────────────

  async function toggleActive(faq: FAQ) {
    try {
      await fetch(`/api/admin/faq/${faq._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !faq.isActive }),
      });
      setFaqs((prev) => prev.map((f) => f._id === faq._id ? { ...f, isActive: !f.isActive } : f));
      toast.success(faq.isActive ? 'FAQ hidden.' : 'FAQ visible.');
    } catch {
      toast.error('Failed to update status.');
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  function handleDelete(faq: FAQ) {
    onDelete({
      title: 'Delete FAQ',
      description: `Delete "${faq.question}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        const res = await fetch(`/api/admin/faq/${faq._id}`, { method: 'DELETE' });
        if (!res.ok) { toast.error('Failed to delete.'); return; }
        toast.success('FAQ deleted.');
        await loadFAQs();
      },
    });
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-4 border border-b-[1px] !border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900">FAQs</h2>
          <p className="text-sm text-gray-500 mt-0.5">{faqs.length} question{faqs.length !== 1 ? 's' : ''} total</p>
        </div>
        {!showForm && (
          <Button onClick={openAdd} size="sm" className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add FAQ
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-primary/20 bg-white p-6 space-y-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-base">
            {editingId ? 'Edit FAQ' : 'New FAQ'}
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Question *</label>
            <Input
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              placeholder="e.g. What services do you offer?"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Answer *</label>
            <Textarea
              value={form.answer}
              onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
              placeholder="Write the answer here..."
              rows={4}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="space-y-1 flex-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Order</label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                className={`w-28 ${duplicateOrder ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
              />
              {duplicateOrder && (
                <p className="text-xs text-red-400">This order number already exists.</p>
              )}
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">Visible on site</label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving || duplicateOrder} size="sm" className="flex items-center gap-2">
              {saving ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
              {editingId ? 'Update FAQ' : 'Save FAQ'}
            </Button>
            <Button onClick={cancelForm} variant="ghost" size="sm" className="flex items-center gap-2">
              <X className="w-4 h-4" /> Cancel
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {faqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3 rounded-2xl border border-dashed border-gray-200">
          <HelpCircle className="w-10 h-10 text-gray-300" />
          <p className="text-gray-500 font-medium">No FAQs yet</p>
          <p className="text-gray-400 text-sm">Click &quot;Add FAQ&quot; to create your first question.</p>
        </div>
      ) : (
        <div className="space-y-3 p-4">
          {faqs.map((faq) => (
            <div
              key={faq._id}
              className={`rounded-2xl border bg-white p-5 min-[320px]:max-[500px]:p-[10px] transition-opacity ${faq.isActive ? 'border-gray-200' : 'border-dashed border-gray-200 opacity-60'}`}
            >
              <div className="flex items-start gap-3 min-[320px]:max-[400px]:gap-[5px]">
                <GripVertical className="w-4 h-4 text-gray-300 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-gray-900 text-sm leading-snug">{faq.question}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${faq.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {faq.isActive ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{faq.answer}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Button onClick={() => openEdit(faq)} variant="ghost" size="sm" className="h-7 px-2.5 text-xs flex items-center gap-1">
                      <Pencil className="w-3 h-3" /> Edit
                    </Button>
                    <Button
                      onClick={() => toggleActive(faq)}
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2.5 text-xs"
                    >
                      {faq.isActive ? 'Hide' : 'Show'}
                    </Button>
                    <Button
                      onClick={() => handleDelete(faq)}
                      variant="destructive"
                      size="sm"
                      className="h-7 px-2.5 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </Button>
                    <span className="text-[10px] text-gray-300 ml-auto">Order: {faq.order}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}