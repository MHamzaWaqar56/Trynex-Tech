'use client';

import { useState, useMemo } from 'react';
import {
  Calendar, Clock, Mail, Phone, MessageSquare,
  Reply, Trash2, User, Briefcase, CheckCircle2,
  XCircle, AlertCircle, Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConsultationBooking {
  _id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

interface DeleteDialogState {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}

interface Props {
  consultations: ConsultationBooking[];
  onDelete: (dialog: DeleteDialogState) => void;
  onRefresh: () => Promise<void>;
  onGmailReply: (to: string, subject: string, body: string) => void;
}

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<
  ConsultationBooking['status'],
  { label: string; icon: React.ReactNode; bar: string; badge: string }
> = {
  pending: {
    label: 'Pending',
    icon: <AlertCircle className="w-3 h-3" />,
    bar:   'from-yellow-500/80 to-yellow-400/20',
    badge: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  },
  confirmed: {
    label: 'Confirmed',
    icon: <CheckCircle2 className="w-3 h-3" />,
    bar:   'from-emerald-500/80 to-emerald-400/20',
    badge: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  cancelled: {
    label: 'Cancelled',
    icon: <XCircle className="w-3 h-3" />,
    bar:   'from-red-500/80 to-red-400/20',
    badge: 'bg-red-50 text-red-500 border-red-100',
  },
};

// ─── Filter type ──────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'pending' | 'confirmed' | 'cancelled';

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConsultationsTab({
  consultations,
  onDelete,
  onRefresh,
  onGmailReply,
}: Props) {

  const [savingId, setSavingId] = useState<string | null>(null);
  const [filter, setFilter]     = useState<FilterKey>('all');

  // Optimistic local state
  const [local, setLocal] = useState<ConsultationBooking[]>(consultations);
  if (local !== consultations && consultations.length !== local.length) {
    setLocal(consultations);
  }

  // ── Counts
  const pendingCount   = local.filter((c) => c.status === 'pending').length;
  const confirmedCount = local.filter((c) => c.status === 'confirmed').length;
  const cancelledCount = local.filter((c) => c.status === 'cancelled').length;

  // ── Filtered list
  const filtered = useMemo(() =>
    filter === 'all' ? local : local.filter((c) => c.status === filter),
    [local, filter],
  );

  const filterButtons: { key: FilterKey; label: string; count: number; cls: string }[] = [
    { key: 'all',       label: 'All',       count: local.length,   cls: '' },
    { key: 'pending',   label: 'Pending',   count: pendingCount,   cls: 'text-yellow-600' },
    { key: 'confirmed', label: 'Confirmed', count: confirmedCount, cls: 'text-emerald-600' },
    { key: 'cancelled', label: 'Cancelled', count: cancelledCount, cls: 'text-red-400' },
  ];

  // ── Update status (optimistic)
  async function updateStatus(id: string, status: ConsultationBooking['status']) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/consultations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setLocal((cur) => cur.map((c) => c._id === id ? { ...c, status } : c));
        toast.success('Status updated.');
      } else {
        toast.error('Status update failed.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setSavingId(null);
    }
  }

  // ── Delete
  function handleDelete(booking: ConsultationBooking) {
    onDelete({
      title: 'Delete consultation?',
      description: `This will permanently remove "${booking.name}"'s booking.`,
      confirmLabel: 'Delete Booking',
      onConfirm: async () => {
        const res = await fetch(`/api/admin/consultations/${booking._id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Consultation deleted.');
          await onRefresh();
        } else {
          toast.error('Delete failed.');
        }
      },
    });
  }

  // ── Gmail reply
  function handleReply(booking: ConsultationBooking) {
    onGmailReply(
      booking.email,
      `Re: Consultation on ${booking.date} at ${booking.time}`,
      `Hi ${booking.name},\n\nThank you for booking a consultation with Trynex Tech.\n\nService: ${booking.service}\nDate: ${booking.date}\nTime: ${booking.time}\n\nBest regards,\nTrynex Tech Team`,
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="p-5 space-y-5 min-[320px]:max-[500px]:p-[6px]">

      {/* ── Header ── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 min-[320px]:max-[500px]:text-[20px]">
                <Calendar className="w-5 h-5 text-primary" />
                Consultation Bookings
              </CardTitle>
              <CardDescription className="mt-1 min-[320px]:max-[500px]:text-justify">
                Review, confirm, cancel and reply to client consultation requests.
              </CardDescription>
            </div>

            {/* Summary chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-100 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-600">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                {pendingCount} Pending
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {confirmedCount} Confirmed
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                {cancelledCount} Cancelled
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ── Filter tabs ── */}
      {local.length > 0 && (
        <div className="flex items-center gap-1 p-1 rounded-xl bg-primary-100 w-fit">
          {filterButtons.map(({ key, label, count, cls }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-[320px]:max-[500px]:px-[8px] ${
                filter === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-slate-500 hover:text-gray-700'
              }`}
            >
              <Filter className="w-3 h-3 min-[320px]:max-[500px]:hidden" />
              <span className={`${filter === key ? '' : cls} min-[320px]:max-[400px]:text-[10px]`}>{label}</span>
              <span className={`inline-flex items-center justify-center rounded-full min-w-[18px] h-[18px] px-1 text-[10px] font-semibold ${
                filter === key ? 'bg-primary-100 text-primary-600' : 'bg-primary-200 text-primary-700'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {local.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-14 text-gray-900">
            <Calendar className="w-8 h-8 opacity-30" />
            <span className="text-sm">No consultations booked yet.</span>
          </CardContent>
        </Card>
      )}

      {local.length > 0 && filtered.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-gray-900 text-sm">
            No {filter} consultations.
          </CardContent>
        </Card>
      )}

      {/* ── Cards grid ── */}
      <div className="grid grid-cols-2 gap-5 min-[320px]:max-[767px]:grid-cols-1">
        {filtered.map((booking) => {
          const s = statusConfig[booking.status];
          const isSaving = savingId === booking._id;

          return (
            <div
              key={booking._id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-primary-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
            >
              {/* Status accent bar */}
              <div className={`h-[3px] w-full bg-gradient-to-r ${s.bar}`} />

              <div className="flex flex-1 flex-col p-5">

                {/* ── Top row — name + status badge ── */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="truncate font-bold text-gray-900">{booking.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 pl-10">
                      <Briefcase className="h-3 w-3 shrink-0 text-gray-900" />
                      <p className="truncate text-xs text-gray-900">{booking.service}</p>
                    </div>
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${s.badge}`}>
                    {s.icon} {s.label}
                  </span>
                </div>

                {/* ── Date / Time / Booked chips ── */}
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {[
                    { icon: <Calendar className="h-4 w-4 text-primary" />, label: 'Date',   value: booking.date },
                    { icon: <Clock     className="h-4 w-4 text-primary" />, label: 'Time',   value: booking.time },
                    {
                      icon: <span className="text-base">📅</span>,
                      label: 'Booked',
                      value: new Date(booking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                    },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex flex-col items-center gap-1 rounded-xl border border-primary-100 bg-primary-50 p-3 text-center">
                      {icon}
                      <span className="text-[10px] uppercase tracking-wider text-primary-400 font-mono">{label}</span>
                      <span className="text-xs font-semibold text-gray-900 leading-tight">{value}</span>
                    </div>
                  ))}
                </div>

                {/* ── Contact + message ── */}
                <div className="mb-4 space-y-2 rounded-xl border border-primary-100 bg-primary-50/60 p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-gray-900" />
                    <span className="text-xs text-gray-900 break-all">{booking.email}</span>
                  </div>
                  {booking.phone && (
                    <div className="flex items-center gap-3 border-t border-primary-100 pt-2">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-gray-900" />
                      <span className="text-xs text-gray-900">{booking.phone}</span>
                    </div>
                  )}
                  {booking.message && (
                    <div className="border-t border-primary-100 pt-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-gray-900" />
                        <span className="text-[10px] uppercase tracking-[0.18em] font-mono text-gray-900">Message</span>
                      </div>
                      <p className="text-xs leading-5 text-gray-600 line-clamp-3">{booking.message}</p>
                    </div>
                  )}
                </div>

                {/* ── Actions ── */}
                <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-center">
                  {/* Status select */}
                  <Select
                    value={booking.status}
                    disabled={isSaving}
                    onValueChange={(val) => updateStatus(booking._id, val as ConsultationBooking['status'])}
                  >
                    <SelectTrigger className="flex-1 h-9 text-xs border-primary-200 bg-white text-gray-900 rounded-xl focus:border-primary/50 disabled:opacity-60">
                      {isSaving
                        ? <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-slate-300 border-t-primary rounded-full animate-spin" /> Saving...</span>
                        : <SelectValue placeholder="Update status" />
                      }
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([val, { label, icon, badge }]) => (
                        <SelectItem key={val} value={val}>
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${badge}`}>
                            {icon} {label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Reply + Delete */}
                  <div className="flex gap-2 shrink-0">
                    <Button
                      type="button" variant="ghost" size="sm"
                      className="h-9 gap-1.5 px-3"
                      onClick={() => handleReply(booking)}
                    >
                      <Reply className="w-3.5 h-3.5" /> Reply
                    </Button>
                    <Button
                      type="button" variant="destructive" size="sm"
                      className="h-9 w-9 p-0 justify-center"
                      onClick={() => handleDelete(booking)}
                      aria-label="Delete booking"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}