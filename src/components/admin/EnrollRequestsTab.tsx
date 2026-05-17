'use client';

import { Reply, Trash2, Clock, CheckCircle, UserCheck, XCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EnrollRequest {
  _id: string;
  courseTitle: string;
  courseSlug: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  education?: string;
  experience?: string;
  message?: string;
  status: 'new' | 'read' | 'contacted' | 'enrolled' | 'rejected';
  createdAt: string;
}

interface DetailDialogState {
  title: string; subtitle: string;
  fields: Array<{ label: string; value: string }>;
  messageLabel: string; message: string;
}

interface DeleteDialogState {
  title: string; description: string; confirmLabel: string;
  onConfirm: () => Promise<void>;
}

interface Props {
  requests: EnrollRequest[];
  onViewDetails: (dialog: DetailDialogState) => void;
  onDelete: (dialog: DeleteDialogState) => void;
  onGmailReply: (to: string, subject: string, body: string) => void;
  onRefresh: () => Promise<void>;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    new:       { label: 'New',       className: 'bg-yellow-50 text-yellow-600',  icon: <Clock className="w-3 h-3" /> },
    read:      { label: 'Read',      className: 'bg-blue-50 text-blue-600',      icon: <CheckCircle className="w-3 h-3" /> },
    contacted: { label: 'Contacted', className: 'bg-primary/10 text-primary',    icon: <Reply className="w-3 h-3" /> },
    enrolled:  { label: 'Enrolled',  className: 'bg-green-50 text-green-600',    icon: <UserCheck className="w-3 h-3" /> },
    rejected:  { label: 'Rejected',  className: 'bg-red-50 text-red-400',        icon: <XCircle className="w-3 h-3" /> },
  };
  const s = map[status] ?? map['new'];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${s.className}`}>
      {s.icon} {s.label}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EnrollRequestsTab({ requests, onViewDetails, onDelete, onGmailReply, onRefresh }: Props) {

  const updateStatus = async (req: EnrollRequest, status: string) => {
    try {
      await fetch(`/api/admin/enroll/${req._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await onRefresh();
      toast.success(`Status updated to "${status}".`);
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleView = (req: EnrollRequest) => {
    if (req.status === 'new') updateStatus(req, 'read');
    onViewDetails({
      title: req.name,
      subtitle: `Enroll request — ${req.courseTitle}`,
      fields: [
        { label: 'Email',      value: req.email },
        { label: 'Phone',      value: req.phone || '—' },
        { label: 'City',       value: req.city || '—' },
        { label: 'Education',  value: req.education || '—' },
        { label: 'Experience', value: req.experience || '—' },
        { label: 'Course',     value: req.courseTitle },
        { label: 'Status',     value: req.status },
        { label: 'Date',       value: new Date(req.createdAt).toLocaleString() },
      ],
      messageLabel: 'Message',
      message: req.message || '—',
    });
  };

  const handleDelete = (req: EnrollRequest) => {
    onDelete({
      title: 'Delete enroll request?',
      description: `This will permanently remove the request from ${req.name}.`,
      confirmLabel: 'Delete Request',
      onConfirm: async () => {
        const res = await fetch(`/api/admin/enroll/${req._id}`, { method: 'DELETE' });
        if (res.ok) { toast.success('Request deleted.'); await onRefresh(); }
        else toast.error('Failed to delete.');
      },
    });
  };

  const handleReply = (req: EnrollRequest) => {
    onGmailReply(
      req.email,
      `Re: Enrollment Request — ${req.courseTitle}`,
      `Hi ${req.name},\n\nThank you for your interest in our course "${req.courseTitle}".\n\nWe have received your enrollment request and our team will get back to you shortly to discuss the next steps.\n\nBest regards,\nTrynex Tech Team`
    );
  };

  const newCount = requests.filter((r) => r.status === 'new').length;

  return (
    <div className="flex flex-col gap-4">

      {/* Summary */}
      {requests.length > 0 && (
        <div className="flex items-center gap-3 px-4 pt-2">
          <span className="text-xs text-gray-900">
            <span className="font-semibold text-gray-900">{requests.length}</span> total
          </span>
          {newCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Clock className="w-3 h-3" /> {newCount} new
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[1000px] w-full text-sm">
          <thead>
            <tr className="border-b border-primary-100">
              {['Name', 'Email', 'Course', 'Status', 'Date', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3.5 text-gray-900 font-mono text-xs uppercase tracking-[0.18em]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-100">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-900">
                    <BookOpen className="w-8 h-8 opacity-30" />
                    <span className="text-sm">No enrollment requests yet.</span>
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req._id} className={`align-middle hover:bg-primary-100 transition-colors ${req.status === 'new' ? 'bg-primary-50/30' : ''}`}>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`font-medium ${req.status === 'new' ? 'text-gray-900' : 'text-gray-600'}`}>
                      {req.name}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-gray-900 text-xs whitespace-nowrap">{req.email}</td>

                  <td className="px-4 py-3.5">
                    <Badge variant="outline" className="max-w-[180px] truncate rounded-full border-white/10 bg-white/[0.03] px-3 py-1 text-xs !text-gray-900">
                      {req.courseTitle}
                    </Badge>
                  </td>

                  <td className="px-4 py-3.5">
                    <StatusBadge status={req.status} />
                  </td>

                  <td className="px-4 py-3.5 text-gray-900 text-xs whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Button type="button" size="sm" variant="ghost" className="h-8 px-3 text-xs" onClick={() => handleView(req)}>
                        View
                      </Button>

                      {/* Status quick change */}
                      <select
                        value={req.status}
                        onChange={(e) => updateStatus(req, e.target.value)}
                        className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:outline-none focus:border-primary/50"
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="contacted">Contacted</option>
                        <option value="enrolled">Enrolled</option>
                        <option value="rejected">Rejected</option>
                      </select>

                      <Button type="button" size="sm" variant="default" className="h-8 w-8 justify-center !p-0"
                        onClick={() => handleReply(req)} aria-label={`Reply to ${req.name}`}>
                        <Reply className="w-3.5 h-3.5" />
                      </Button>

                      <Button type="button" size="sm" variant="destructive" className="h-8 w-8 !p-0 justify-center"
                        onClick={() => handleDelete(req)} aria-label={`Delete request from ${req.name}`}>
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