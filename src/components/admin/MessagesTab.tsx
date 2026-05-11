'use client';

import { Reply, Trash2, Mail, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Message {
  _id: string;
  name: string;
  email: string;
  service?: string;
  message: string;
  inquiryType?: string;
  status: 'new' | 'read' | string;
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
  messages: Message[];
  onViewDetails: (dialog: DetailDialogState) => void;
  onDelete: (dialog: DeleteDialogState) => void;
  onGmailReply: (to: string, subject: string, body: string) => void;
  onRefresh: () => Promise<void>;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === 'new') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-[11px] font-medium text-yellow-600">
        <Clock className="w-3 h-3" />
        New
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-600">
      <CheckCircle className="w-3 h-3" />
      Read
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MessagesTab({
  messages,
  onViewDetails,
  onDelete,
  onGmailReply,
  onRefresh,
}: Props) {

  // Mark message as read via API
  const markAsRead = async (message: Message) => {
    if (message.status === 'read') return;
    try {
      await fetch(`/api/admin/messages?id=${encodeURIComponent(message._id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' }),
      });
      await onRefresh();
    } catch {
      // silently ignore — not critical
    }
  };

  const handleView = (message: Message) => {
    markAsRead(message);
    onViewDetails({
      title: message.name,
      subtitle: 'Client message',
      fields: [
        { label: 'Email', value: message.email },
        { label: 'Service', value: message.service || '—' },
        { label: 'Status', value: message.status },
        { label: 'Date', value: new Date(message.createdAt).toLocaleString() },
      ],
      messageLabel: 'Message',
      message: message.message,
    });
  };

  const handleDelete = (message: Message) => {
    onDelete({
      title: 'Delete message?',
      description: `This will permanently remove the message from ${message.name}.`,
      confirmLabel: 'Delete Message',
      onConfirm: async () => {
        const res = await fetch(
          `/api/admin/messages?id=${encodeURIComponent(message._id)}`,
          { method: 'DELETE' }
        );
        if (res.ok) {
          toast.success('Message deleted successfully');
          await onRefresh();
        } else {
          toast.error('Message delete failed');
        }
      },
    });
  };

  const handleReply = (message: Message) => {
    onGmailReply(
      message.email,
      `Re: Message from ${message.name}`,
      `Hi ${message.name},\n\nThank you for reaching out to Trynex Tech.\n\n${message.message}\n\nBest regards,\nTrynex Tech Team`
    );
  };

  const newCount = messages.filter((m) => m.status === 'new').length;

  return (
    <div className="flex flex-col gap-4">

      {/* ── Summary bar ── */}
      {messages.length > 0 && (
        <div className="flex items-center gap-3 px-4 pt-2">
          <span className="text-xs text-gray-900">
            <span className="font-semibold text-gray-900">{messages.length}</span> total
          </span>
          {newCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Clock className="w-3 h-3" />
              {newCount} unread
            </span>
          )}
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead>
            <tr className="border-b border-primary-100">
              {['Name', 'Email', 'Service', 'Date', 'Actions'].map((h) => (
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
            {messages.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-900">
                    <Mail className="w-8 h-8 opacity-30" />
                    <span className="text-sm">No messages yet.</span>
                  </div>
                </td>
              </tr>
            ) : (
              messages.map((message) => (
                <tr
                  key={message._id}
                  className={`align-middle hover:bg-primary-100 transition-colors ${
                    message.status === 'new' ? 'bg-primary-50/30' : ''
                  }`}
                >
                  {/* Name — bold if unread */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`font-medium ${
                        message.status === 'new' ? 'text-gray-900' : 'text-gray-600'
                      }`}
                    >
                      {message.name}
                    </span>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3.5 text-gray-900 text-xs whitespace-nowrap">
                    {message.email}
                  </td>

                  {/* Service */}
                  <td className="px-4 py-3.5">
                    <Badge
                      variant="outline"
                      className="max-w-[200px] truncate rounded-full border-white/10 bg-white/[0.03] px-3 py-1 text-xs !text-gray-900"
                    >
                      {message.service || '—'}
                    </Badge>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3.5 text-gray-900 text-xs whitespace-nowrap">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 px-3 text-xs"
                        onClick={() => handleView(message)}
                      >
                        View
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        className="h-8 w-8 justify-center !p-0"
                        onClick={() => handleReply(message)}
                        aria-label={`Reply to ${message.name}`}
                      >
                        <Reply className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 !p-0 justify-center"
                        onClick={() => handleDelete(message)}
                        aria-label={`Delete message from ${message.name}`}
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