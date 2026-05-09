'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Mail, Send, Users, Trash2, RefreshCw,
  UserCheck, UserX, CheckSquare, Square,
  Filter, Search,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// ─── Types ────────────────────────────────────────────────────────────────────

type Subscriber = {
  _id: string;
  email: string;
  active: boolean;
  subscribedAt: string;
};

interface DeleteDialogState {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}

interface Props {
  onDelete: (dialog: DeleteDialogState) => void;
}

type FilterKey = 'all' | 'active' | 'inactive';

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewsletterTab({ onDelete }: Props) {

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading]         = useState(true);
  const [togglingId, setTogglingId]   = useState<string | null>(null);
  const [sending, setSending]         = useState(false);
  const [subject, setSubject]         = useState('');
  const [message, setMessage]         = useState('');
  const [selected, setSelected]       = useState<string[]>([]);
  const [filter, setFilter]           = useState<FilterKey>('all');
  const [search, setSearch]           = useState('');

  // ── Load subscribers
  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/newsletter');
      const data = await res.json();
      if (res.ok) setSubscribers(data.subscribers || []);
      else toast.error('Failed to load subscribers.');
    } catch {
      toast.error('Network error.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  // ── Counts
  const activeCount   = subscribers.filter((s) => s.active).length;
  const inactiveCount = subscribers.filter((s) => !s.active).length;

  // ── Filtered + searched list
  const filtered = useMemo(() => {
    let list = subscribers;
    if (filter === 'active')   list = list.filter((s) => s.active);
    if (filter === 'inactive') list = list.filter((s) => !s.active);
    if (search.trim())         list = list.filter((s) => s.email.toLowerCase().includes(search.trim().toLowerCase()));
    return list;
  }, [subscribers, filter, search]);

  // ── Selection helpers
  const activeFiltered   = filtered.filter((s) => s.active);
  const allActiveSelected = activeFiltered.length > 0 && activeFiltered.every((s) => selected.includes(s.email));

  function toggleSelect(email: string) {
    setSelected((prev) => prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]);
  }

  function toggleSelectAll() {
    const activeEmails = activeFiltered.map((s) => s.email);
    if (allActiveSelected) {
      setSelected((prev) => prev.filter((e) => !activeEmails.includes(e)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...activeEmails])));
    }
  }

  // ── Toggle active/inactive (optimistic)
  async function toggleActive(sub: Subscriber) {
    setTogglingId(sub._id);
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sub._id, active: !sub.active }),
      });
      if (res.ok) {
        setSubscribers((prev) => prev.map((s) => s._id === sub._id ? { ...s, active: !sub.active } : s));
        if (sub.active) setSelected((prev) => prev.filter((e) => e !== sub.email));
        toast.success(sub.active ? 'Subscriber deactivated.' : 'Subscriber activated.');
      } else {
        toast.error('Update failed.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setTogglingId(null);
    }
  }

  // ── Delete
  function handleDelete(sub: Subscriber) {
    onDelete({
      title: 'Delete subscriber?',
      description: `This will permanently remove "${sub.email}" from the newsletter list.`,
      confirmLabel: 'Delete Subscriber',
      onConfirm: async () => {
        const res = await fetch(`/api/admin/newsletter?id=${sub._id}`, { method: 'DELETE' });
        if (res.ok) {
          setSubscribers((prev) => prev.filter((s) => s._id !== sub._id));
          setSelected((prev) => prev.filter((e) => e !== sub.email));
          toast.success('Subscriber deleted.');
        } else {
          toast.error('Delete failed.');
        }
      },
    });
  }

  // ── Send newsletter
  async function sendEmail() {
    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and message are required.');
      return;
    }
    const targetCount = selected.length > 0 ? selected.length : activeCount;
    if (targetCount === 0) {
      toast.error('No active subscribers to send to.');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          message,
          emails: selected.length > 0 ? selected : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`✅ Sent: ${data.sent}${data.failed ? `, Failed: ${data.failed}` : ''}`);
        setSubject('');
        setMessage('');
        setSelected([]);
      } else {
        toast.error(data.error || 'Send failed.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setSending(false);
    }
  }

  const filterButtons: { key: FilterKey; label: string; count: number }[] = [
    { key: 'all',      label: 'All',      count: subscribers.length },
    { key: 'active',   label: 'Active',   count: activeCount },
    { key: 'inactive', label: 'Inactive', count: inactiveCount },
  ];

  const sendTargetCount  = selected.length > 0 ? selected.length : activeCount;
  const sendTargetLabel  = selected.length > 0
    ? `${selected.length} Selected`
    : `All ${activeCount} Active`;

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="p-5 space-y-5 min-[320px]:max-[500px]:p-0">

      {/* ── Header ── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Newsletter
              </CardTitle>
              <CardDescription className="mt-1">
                Manage subscribers and send newsletter emails.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {activeCount} Active
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-gray-600">
                <Users className="w-3 h-3" />
                {subscribers.length} Total
              </span>
              <Button type="button" variant="ghost" size="sm"
                onClick={load} disabled={loading} className="gap-1.5">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5">

        {/* ── LEFT: Subscribers list ── */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="border-b border-primary-100 pb-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Subscribers
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {selected.length > 0
                    ? `${selected.length} selected — email will go to selected only`
                    : 'Select to send to specific subscribers, or leave empty for all active'}
                </CardDescription>
              </div>
            </div>

            {/* Filter + Search */}
            <div className="flex flex-col gap-2 mt-3">
              {/* Filter tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-primary-100 w-fit">
                {filterButtons.map(({ key, label, count }) => (
                  <button key={key} type="button" onClick={() => setFilter(key)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      filter === key ? 'bg-white text-gray-900 shadow-sm' : 'text-slate-500 hover:text-gray-700'
                    }`}>
                    <Filter className="w-3 h-3" />
                    {label}
                    <span className={`inline-flex items-center justify-center rounded-full min-w-[16px] h-4 px-1 text-[10px] font-semibold ${
                      filter === key ? 'bg-primary-100 text-primary-600' : 'bg-primary-200 text-primary-700'
                    }`}>{count}</span>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by email..."
                  className="pl-8 h-8 text-xs"
                />
              </div>

              {/* Select all active */}
              {activeFiltered.length > 0 && (
                <button type="button" onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary transition-colors self-start">
                  {allActiveSelected
                    ? <CheckSquare className="w-3.5 h-3.5 text-primary" />
                    : <Square className="w-3.5 h-3.5" />}
                  {allActiveSelected ? 'Deselect all' : 'Select all active'}
                </button>
              )}
            </div>
          </CardHeader>

          <CardContent className="!p-0 flex-1">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-gray-600 text-sm">
                <span className="w-4 h-4 border-2 border-primary-300 border-t-primary rounded-full animate-spin" />
                Loading...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-gray-900 text-sm">
                {subscribers.length === 0 ? 'No subscribers yet.' : 'No matching subscribers.'}
              </div>
            ) : (
              <div className="max-h-[380px] overflow-y-auto divide-y divide-primary-50">
                {filtered.map((sub) => (
                  <div
                    key={sub._id}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-primary-100 transition-colors ${
                      selected.includes(sub.email) ? 'bg-primary/5 border-l-2 border-primary' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selected.includes(sub.email)}
                      onChange={() => toggleSelect(sub.email)}
                      disabled={!sub.active}
                      className="accent-primary w-4 h-4 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                    />

                    {/* Email + date */}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm truncate ${sub.active ? 'text-gray-900' : 'text-slate-400 line-through'}`}>
                        {sub.email}
                      </p>
                      <p className="text-[11px] text-gray-600">
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0 ${
                      sub.active
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {sub.active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      {sub.active ? 'Active' : 'Inactive'}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button type="button" variant="ghost" size="sm"
                        className="h-8 w-8 !p-0 justify-center"
                        disabled={togglingId === sub._id}
                        onClick={() => toggleActive(sub)}
                        title={sub.active ? 'Deactivate' : 'Activate'}>
                        {togglingId === sub._id
                          ? <span className="w-3 h-3 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
                          : sub.active
                          ? <UserX className="w-3.5 h-3.5 text-yellow-500" />
                          : <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                        }
                      </Button>
                      <Button type="button" variant="destructive" size="sm"
                        className="h-8 w-8 !p-0 justify-center"
                        onClick={() => handleDelete(sub)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── RIGHT: Send email ── */}
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" /> Send Newsletter
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {selected.length > 0
                ? `Will send to ${selected.length} selected subscriber(s)`
                : activeCount > 0
                ? `Will send to all ${activeCount} active subscribers`
                : 'No active subscribers to send to'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-4">

            {/* Selected pills */}
            {selected.length > 0 && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-primary">{selected.length} selected</p>
                  <button type="button" onClick={() => setSelected([])}
                    className="text-[11px] text-gray-600 hover:text-red-400 transition-colors">
                    Clear selection
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
                  {selected.map((email) => (
                    <span key={email}
                      className="inline-flex items-center gap-1 rounded-full bg-white border border-primary/20 px-2 py-0.5 text-[11px] text-primary">
                      {email}
                      <button type="button" onClick={() => toggleSelect(email)}
                        className="hover:text-red-400 transition-colors ml-0.5"><X className="w-3.5 h-3.5" /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Subject *</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. New Service Launch — Trynex Tech"
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Message *</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={10}
                placeholder="Write your newsletter content here..."
                className="resize-none"
              />
            </div>

            {/* Send button */}
            <Button
              type="button"
              className="w-full justify-center gap-2"
              disabled={sending || sendTargetCount === 0}
              onClick={sendEmail}
            >
              {sending ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> Send to {sendTargetLabel}</>
              )}
            </Button>

            {activeCount === 0 && !loading && (
              <p className="text-xs text-slate-400 text-center">
                No active subscribers to send to.
              </p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}