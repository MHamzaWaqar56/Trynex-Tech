


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Mail,
  RefreshCw,
  Send,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

type Subscriber = {
  _id: string;
  email: string;
  active: boolean;
  subscribedAt: string;
};

export default function NewsletterSubscribersPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Subscriber | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Send newsletter state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
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
  };

  useEffect(() => { void load(); }, []);

  const toggleActive = async (sub: Subscriber) => {
    setTogglingId(sub._id);
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sub._id, active: !sub.active }),
      });
      if (res.ok) {
        setSubscribers((prev) => prev.map((s) => s._id === sub._id ? { ...s, active: !sub.active } : s));
        toast.success(sub.active ? 'Subscriber deactivated.' : 'Subscriber activated.');
      } else {
        toast.error('Update failed.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const res = await fetch(`/api/admin/newsletter?id=${deleteTarget._id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubscribers((prev) => prev.filter((s) => s._id !== deleteTarget._id));
        toast.success('Subscriber deleted.');
        setDeleteTarget(null);
      } else {
        toast.error('Delete failed.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setDeleteBusy(false);
    }
  };

  const sendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and message are required.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Sent: ${data.sent}, Failed: ${data.failed}`);
        setSubject('');
        setMessage('');
      } else {
        toast.error(data.error || 'Send failed.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setSending(false);
    }
  };

  const activeCount = subscribers.filter((s) => s.active).length;
  const inactiveCount = subscribers.filter((s) => !s.active).length;

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-8 lg:py-12">

       
        {/* Page header */}
        <div className="glass-card p-6 sm:p-8 mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3">
                <span className="section-badge">
                  <Mail className="h-3.5 w-3.5" />
                  Newsletter
                </span>
              </div>
              <h1 className="section-title mb-2">
                Newsletter <span className="gradient-text">Subscribers</span>
              </h1>
              <p className="text-gray-900 text-sm max-w-xl leading-relaxed">
                Manage newsletter subscribers — activate, deactivate, or remove them. Send newsletters to all active subscribers.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 lg:shrink-0">
              {[
                { label: 'Total', value: subscribers.length, icon: Users, color: 'text-gray-900' },
                { label: 'Active', value: activeCount, icon: UserPlus, color: 'text-emerald-600' },
                { label: 'Inactive', value: inactiveCount, icon: UserMinus, color: 'text-gray-900' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="glass-card-hover p-4 text-center">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
                  <p className="text-[11px] uppercase tracking-widest font-mono text-gray-900 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

          {/* Left: Subscribers list */}
          <div className="glass-card overflow-hidden">
            {/* List header */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-100">
              <div>
                <div className="mb-1">
                  <span className="section-badge text-[10px] py-1 px-2.5">
                    <Users className="h-3 w-3" />
                    All Subscribers
                  </span>
                </div>
                <p className="text-sm text-gray-900">
                  {loading ? 'Loading...' : `${subscribers.length} total subscribers`}
                </p>
              </div>
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="btn-ghost text-sm py-2 px-3 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* List body */}
            {loading ? (
              <div className="p-10 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <p className="text-sm text-gray-900">Loading subscribers...</p>
              </div>
            ) : subscribers.length === 0 ? (
              <div className="p-10 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-gray-900">No subscribers yet</p>
                <p className="text-xs text-gray-900 max-w-xs leading-relaxed">
                  Subscribers will appear here once someone signs up for the newsletter.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {subscribers.map((sub) => (
                  <div
                    key={sub._id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Avatar */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold font-display ${
                        sub.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-gray-900 border border-slate-200'
                      }`}
                    >
                      {sub.email.charAt(0).toUpperCase()}
                    </div>

                    {/* Email + date */}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${sub.active ? 'text-gray-900' : 'text-gray-900 line-through opacity-50'}`}>
                        {sub.email}
                      </p>
                      <p className="text-xs text-gray-900 mt-0.5 font-mono">
                        {new Date(sub.subscribedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    {/* Status tag */}
                    <span
                      className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest ${
                        sub.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-gray-900 border border-slate-200'
                      }`}
                    >
                      {sub.active ? 'Active' : 'Inactive'}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleActive(sub)}
                        disabled={togglingId === sub._id}
                        title={sub.active ? 'Deactivate' : 'Activate'}
                        className="btn-ghost p-2 rounded-lg disabled:opacity-50"
                      >
                        {sub.active
                          ? <UserX className="w-4 h-4 text-amber-500" />
                          : <UserCheck className="w-4 h-4 text-emerald-600" />
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(sub)}
                        className="btn-ghost p-2 rounded-lg text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Send newsletter */}
          <div className="glass-card overflow-hidden h-fit">
            {/* Form header */}
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="mb-1">
                <span className="section-badge text-[10px] py-1 px-2.5">
                  <Send className="h-3 w-3" />
                  Send Newsletter
                </span>
              </div>
              <p className="text-sm text-gray-900 mt-1">
                {activeCount > 0
                  ? `Will be delivered to all ${activeCount} active subscribers`
                  : 'No active subscribers yet'}
              </p>
            </div>

            {/* Form body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-900 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. New Service Launch — Trynex Tech"
                  className="w-full rounded-lg border border-primary/30 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-900/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-900 mb-2">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={10}
                  placeholder="Write your newsletter content here..."
                  className="w-full resize-none rounded-lg border border-primary/30 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-900/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={sendEmail}
                disabled={sending || activeCount === 0}
                className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none"
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send to {activeCount} Active Subscriber{activeCount !== 1 ? 's' : ''}
                  </>
                )}
              </button>

              {activeCount === 0 && (
                <p className="text-xs text-gray-900 text-center font-mono">
                  No active subscribers to send to.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Subscriber?"
        description={`This will permanently remove "${deleteTarget?.email}" from the newsletter list.`}
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}