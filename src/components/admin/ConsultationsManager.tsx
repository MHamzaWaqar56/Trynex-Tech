"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { Calendar, Clock, Mail, Phone, MessageSquare, Reply, Trash2, RefreshCw, User, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

type ConsultationBooking = {
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
};

type Props = {
  consultations: ConsultationBooking[];
  onRefresh: () => Promise<void>;
};

const statusConfig: Record<ConsultationBooking['status'], {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
}> = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/25',
    dot: 'bg-yellow-400',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/25',
    dot: 'bg-emerald-400',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/25',
    dot: 'bg-red-400',
  },
};

export default function ConsultationsManager({ consultations, onRefresh }: Props) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConsultationBooking | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const openGmailReply = (booking: ConsultationBooking) => {
    const subject = `Re: Consultation on ${booking.date} at ${booking.time}`;
    const body = `Hi ${booking.name},\n\nThanks for booking a consultation with Trynex Tech.\n\nService: ${booking.service}\nDate: ${booking.date}\nTime: ${booking.time}\n\nBest regards,\nTrynex Tech Team`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(booking.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  const updateStatus = async (id: string, status: ConsultationBooking['status']) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/consultations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) { toast.error('Status update failed.'); return; }
      toast.success('Status updated.');
      await onRefresh();
    } finally {
      setSavingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const res = await fetch(`/api/admin/consultations/${deleteTarget._id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Consultation deleted.');
        setDeleteTarget(null);
        await onRefresh();
      } else {
        toast.error('Delete failed.');
      }
    } catch {
      toast.error('Delete failed.');
    } finally {
      setDeleteBusy(false);
    }
  };

  const pending = consultations.filter((c) => c.status === 'pending').length;
  const confirmed = consultations.filter((c) => c.status === 'confirmed').length;
  const cancelled = consultations.filter((c) => c.status === 'cancelled').length;

  return (
    <div className="p-5 space-y-5">

      {/* Header card */}
      <Card className="overflow-hidden border-white/10 bg-white/[0.03] shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <CardHeader className="border-b border-white/10 bg-white/[0.02]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-display">Consultation Bookings</CardTitle>
              <CardDescription className="max-w-xl text-sm leading-6">
                Review, confirm, cancel and reply to client consultation requests.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* Stats pills */}
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />{pending} Pending
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{confirmed} Confirmed
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-semibold text-red-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />{cancelled} Cancelled
                </span>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4" /> Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Cards grid */}
      {consultations.length === 0 ? (
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
              <Calendar className="h-7 w-7 text-dark-muted" />
            </div>
            <p className="text-dark-muted">No consultations booked yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 max-h-[580px] overflow-y-auto pr-1">
          {consultations.map((booking) => {
            const s = statusConfig[booking.status];
            return (
              <div
                key={booking._id}
                className="group relative flex flex-col overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.03] shadow-[0_14px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              >
                {/* Colored top accent bar */}
                <div className={`h-[3px] w-full ${booking.status === 'confirmed' ? 'bg-gradient-to-r from-emerald-500/80 to-emerald-400/20' : booking.status === 'cancelled' ? 'bg-gradient-to-r from-red-500/80 to-red-400/20' : 'bg-gradient-to-r from-yellow-500/80 to-yellow-400/20'}`} />

                <div className="flex flex-1 flex-col p-6">

                  {/* Top row — name + status badge */}
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="truncate text-lg font-bold text-white">{booking.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 pl-10">
                        <Briefcase className="h-3.5 w-3.5 shrink-0 text-dark-muted" />
                        <p className="truncate text-sm text-dark-muted">{booking.service}</p>
                      </div>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${s.color} ${s.bg} ${s.border}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </div>

                  {/* Date / Time / Booked chips */}
                  <div className="mb-5 grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                      <Calendar className="h-4 w-4 text-primary mb-0.5" />
                      <span className="text-[11px] uppercase tracking-wide text-dark-muted font-mono">Date</span>
                      <span className="text-xs font-semibold text-white leading-tight">{booking.date}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                      <Clock className="h-4 w-4 text-primary mb-0.5" />
                      <span className="text-[11px] uppercase tracking-wide text-dark-muted font-mono">Time</span>
                      <span className="text-xs font-semibold text-white">{booking.time}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                      <span className="text-base mb-0.5">📅</span>
                      <span className="text-[11px] uppercase tracking-wide text-dark-muted font-mono">Booked</span>
                      <span className="text-xs font-semibold text-white">{new Date(booking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="mb-5 space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-dark-muted" />
                      <span className="text-xs text-dark-muted break-all">{booking.email}</span>
                    </div>
                    {booking.phone && (
                      <div className="flex items-center gap-3 border-t border-white/10 pt-2">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-dark-muted" />
                        <span className="text-xs text-dark-muted">{booking.phone}</span>
                      </div>
                    )}
                    {booking.message && (
                      <div className="border-t border-white/10 pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-3.5 w-3.5 text-dark-muted" />
                          <span className="text-[11px] uppercase tracking-[0.18em] font-mono text-dark-muted">Message</span>
                        </div>
                        <p className="text-xs leading-6 text-white/80 line-clamp-3">{booking.message}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Select
                      value={booking.status}
                      disabled={savingId === booking._id}
                      onValueChange={(value) => updateStatus(booking._id, value as ConsultationBooking['status'])}
                    >
                      <SelectTrigger className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-primary/50 disabled:opacity-60">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2 shrink-0">
                      <Button type="button" variant="secondary" size="sm" onClick={() => openGmailReply(booking)}>
                        <Reply className="w-4 h-4" /> Reply
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => setDeleteTarget(booking)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Consultation?"
        description={`This will permanently remove the booking for "${deleteTarget?.name}". This cannot be undone.`}
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}