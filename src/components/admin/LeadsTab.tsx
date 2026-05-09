'use client';

import { Reply, Trash2, TrendingUp, Users, Clock, CheckCircle2, XCircle, PhoneCall } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service: string;
  budget?: string;
  deadline?: string;
  message: string;
  leadType: string;
  status: string;
  createdAt: string;
}

interface DetailDialogState {
  title: string;
  subtitle: string;
  fields: Array<{ label: string; value: string }>;
  messageLabel: string;
  message: string;
}

interface DeleteDialogState {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  leads: Lead[];
  onViewDetails: (dialog: DetailDialogState) => void;
  onDelete: (dialog: DeleteDialogState) => void;
  onGmailReply: (to: string, subject: string, body: string) => void;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const leadTypeColors: Record<string, string> = {
  quote:        'bg-blue-50 text-blue-600 border-blue-100',
  consultation: 'bg-purple-50 text-purple-600 border-purple-100',
  new:          'bg-yellow-50 text-yellow-600 border-yellow-100',
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  new:           { label: 'New',         icon: <Clock className="w-3 h-3" />,         cls: 'text-yellow-600 bg-yellow-50' },
  contacted:     { label: 'Contacted',   icon: <PhoneCall className="w-3 h-3" />,     cls: 'text-sky-600 bg-sky-50' },
  'in-progress': { label: 'In Progress', icon: <TrendingUp className="w-3 h-3" />,    cls: 'text-purple-600 bg-purple-50' },
  done:          { label: 'Done',        icon: <CheckCircle2 className="w-3 h-3" />,  cls: 'text-green-600 bg-green-50' },
  closed:        { label: 'Closed',      icon: <XCircle className="w-3 h-3" />,       cls: 'text-slate-500 bg-slate-100' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function LeadTypeBadge({ type }: { type: string }) {
  const cls = leadTypeColors[type] ?? 'bg-slate-50 text-slate-500 border-slate-100';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${cls}`}>
      {type}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LeadsTab({
  leads,
  onViewDetails,
  onDelete,
  onGmailReply,
  onUpdateStatus,
  onRefresh,
}: Props) {

  const handleView = (lead: Lead) => {
    onViewDetails({
      title: lead.name,
      subtitle: 'Lead inquiry',
      fields: [
        { label: 'Email',    value: lead.email },
        { label: 'Phone',    value: lead.phone    || '—' },
        { label: 'Company',  value: lead.company  || '—' },
        { label: 'Service',  value: lead.service },
        { label: 'Type',     value: lead.leadType },
        { label: 'Budget',   value: lead.budget   || '—' },
        { label: 'Deadline', value: lead.deadline || '—' },
        { label: 'Status',   value: lead.status },
        { label: 'Date',     value: new Date(lead.createdAt).toLocaleString() },
      ],
      messageLabel: 'Message',
      message: lead.message,
    });
  };

  const handleDelete = (lead: Lead) => {
    onDelete({
      title: 'Delete lead?',
      description: `This will permanently remove the lead from ${lead.name}.`,
      confirmLabel: 'Delete Lead',
      onConfirm: async () => {
        const res = await fetch(`/api/admin/lead/${lead._id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Lead deleted successfully');
          await onRefresh();
        } else {
          toast.error('Lead delete failed');
        }
      },
    });
  };

  const handleReply = (lead: Lead) => {
    onGmailReply(
      lead.email,
      `Re: Quote / Lead from ${lead.name}`,
      `Hi ${lead.name},\n\nThank you for your inquiry regarding ${lead.service}.\n\nWe received your budget/details and will get back to you shortly.\n\nBest regards,\nTrynex Tech Team`
    );
  };

  const handleStatusChange = async (id: string, status: string) => {
    await onUpdateStatus(id, status);
  };

  // ── Summary counts
  const newCount        = leads.filter((l) => l.status === 'new').length;
  const activeCount     = leads.filter((l) => l.status === 'in-progress').length;

  return (
    <div className="flex flex-col gap-4">

      {/* ── Summary bar ── */}
      {leads.length > 0 && (
        <div className="flex items-center gap-3 px-4 pt-2 flex-wrap">
          <span className="text-xs text-gray-900">
            <span className="font-semibold text-gray-900">{leads.length}</span> total leads
          </span>
          {newCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Clock className="w-3 h-3" />
              {newCount} new
            </span>
          )}
          {activeCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary">
              <TrendingUp className="w-3 h-3" />
              {activeCount} in progress
            </span>
          )}
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="min-w-[1180px] w-full text-sm">
          <thead>
            <tr className="border-b border-primary-100">
              {['Name', 'Email', 'Service', 'Type', 'Budget', 'Status', 'Date', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3.5 text-gray-900 font-mono text-xs uppercase tracking-[0.18em]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-primary-100">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-900">
                    <Users className="w-8 h-8 opacity-30" />
                    <span className="text-sm">No leads yet.</span>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead._id}
                  className={`align-middle hover:bg-primary-100 transition-colors ${
                    lead.status === 'new' ? 'bg-primary-50/30' : ''
                  }`}
                >
                  {/* Name */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    {lead.company && (
                      <div className="text-[11px] text-gray-600 mt-0.5">{lead.company}</div>
                    )}
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3.5 text-gray-900 text-xs whitespace-nowrap">
                    {lead.email}
                    {lead.phone && (
                      <div className="text-[11px] text-gray-600 mt-0.5">{lead.phone}</div>
                    )}
                  </td>

                  {/* Service */}
                  <td className="px-4 py-3.5">
                    <Badge
                      variant="outline"
                      className="max-w-[180px] truncate rounded-full border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-gray-900"
                    >
                      {lead.service}
                    </Badge>
                  </td>

                  {/* Lead Type */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <LeadTypeBadge type={lead.leadType} />
                  </td>

                  {/* Budget */}
                  <td className="px-4 py-3.5 text-gray-900 text-xs whitespace-nowrap">
                    {lead.budget || '—'}
                  </td>

                  {/* Status Select */}
                  <td className="px-4 py-3.5">
                    <Select
                      value={lead.status}
                      onValueChange={(value) => handleStatusChange(lead._id, value)}
                    >
                      <SelectTrigger className="h-8 min-w-[140px] text-xs border-slate-200 bg-white text-gray-900 rounded-lg focus:outline-none focus:border-primary/50">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([val, { label, icon, cls }]) => (
                          <SelectItem key={val} value={val}>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>
                              {icon}
                              {label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3.5 text-gray-900 text-xs whitespace-nowrap">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 px-3 text-xs"
                        onClick={() => handleView(lead)}
                      >
                        View
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        className="h-8 w-8 !p-0"
                        onClick={() => handleReply(lead)}
                        aria-label={`Reply to ${lead.name}`}
                      >
                        <Reply className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 !p-0 "
                        onClick={() => handleDelete(lead)}
                        aria-label={`Delete lead from ${lead.name}`}
                      >
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