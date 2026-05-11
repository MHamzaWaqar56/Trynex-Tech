
'use client';

import { useState, useEffect } from 'react';
import {
  Star, Trash2, CheckCircle2, EyeOff,
  MessageSquare, Clock, Filter, Send, Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Testimonial {
  _id: string;
  name: string;
  company: string;
  role?: string;
  rating: number;
  review: string;
  approved: boolean;
}

type PortfolioProject = {
  _id: string;
  slug: string;
  title: string;
  client: string;
};

interface DeleteDialogState {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}

interface Props {
  reviews: Testimonial[];
  onDelete: (dialog: DeleteDialogState) => void;
  onRefresh: () => Promise<void>;
}

// ─── Star rating display ──────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= rating ? 'text-primary fill-primary' : 'text-primary'}`}
        />
      ))}
      <span className="ml-1 text-[11px] text-slate-400">{rating}/5</span>
    </div>
  );
}

// ─── Filter type ──────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'pending' | 'approved';

// ─── Component ────────────────────────────────────────────────────────────────

export default function TestimonialsTab({ reviews, onDelete, onRefresh }: Props) {
  const [busyId, setBusyId]     = useState<string | null>(null);
  const [filter, setFilter]     = useState<FilterKey>('all');

  // Optimistic local state so UI updates instantly without waiting for refresh
  const [localReviews, setLocalReviews] = useState<Testimonial[]>(reviews);

  // Sync when parent passes new reviews (e.g. after delete refresh)
  if (localReviews !== reviews && reviews.length !== localReviews.length) {
    setLocalReviews(reviews);
  }

  // ── Review Request form state
  const [projects, setProjects]         = useState<PortfolioProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [reqEmail, setReqEmail]         = useState('');
  const [reqName, setReqName]           = useState('');
  const [reqSlug, setReqSlug]           = useState('');
  const [reqBusy, setReqBusy]           = useState(false);

  // Fetch portfolio projects for dropdown
  useEffect(() => {
    fetch('/api/portfolio')
      .then((r) => r.json())
      .then((data) => setProjects(Array.isArray(data?.projects) ? data.projects : []))
      .catch(() => {})
      .finally(() => setProjectsLoading(false));
  }, []);

  async function sendReviewRequest() {
    if (!reqEmail.trim() || !reqName.trim() || !reqSlug) {
      toast.error('Please fill in all fields and select a project.');
      return;
    }
    setReqBusy(true);
    try {
      const payload = { clientEmail: reqEmail.trim(), clientName: reqName.trim(), projectSlug: reqSlug };
      console.log('[sendReviewRequest] sending:', payload);
      const res = await fetch('/api/admin/review-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('Review request email sent successfully!');
        setReqEmail('');
        setReqName('');
        setReqSlug('');
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || 'Failed to send email.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setReqBusy(false);
    }
  }

  // ── Approve / Hide
  async function setApproval(id: string, approved: boolean) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      if (res.ok) {
        toast.success(approved ? 'Testimonial approved!' : 'Testimonial hidden.');
        // Optimistic update
        setLocalReviews((cur) =>
          cur.map((r) => (r._id === id ? { ...r, approved } : r)),
        );
      } else {
        toast.error(approved ? 'Approval failed.' : 'Update failed.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setBusyId(null);
    }
  }

  // ── Delete
  function handleDelete(review: Testimonial) {
    onDelete({
      title: 'Delete testimonial?',
      description: `This will permanently remove "${review.name}"'s testimonial.`,
      confirmLabel: 'Delete Testimonial',
      onConfirm: async () => {
        const res = await fetch(`/api/admin/testimonials/${review._id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Testimonial deleted.');
          await onRefresh();
        } else {
          toast.error('Delete failed.');
        }
      },
    });
  }

  // ── Counts
  const totalCount    = localReviews.length;
  const pendingCount  = localReviews.filter((r) => !r.approved).length;
  const approvedCount = localReviews.filter((r) => r.approved).length;

  // ── Filtered list
  const filtered = localReviews.filter((r) => {
    if (filter === 'pending')  return !r.approved;
    if (filter === 'approved') return r.approved;
    return true;
  });

  const filterButtons: { key: FilterKey; label: string; count: number }[] = [
    { key: 'all',      label: 'All',      count: totalCount },
    { key: 'pending',  label: 'Pending',  count: pendingCount },
    { key: 'approved', label: 'Approved', count: approvedCount },
  ];

  return (
    <div className="flex flex-col gap-5 p-5">

      {/* ── Request Review Section ── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Request a Client Review
          </CardTitle>
          <CardDescription className="text-xs">
            Enter the client&apos;s email and select their project — they&apos;ll receive a one-time review link valid for 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Client Name *</label>
            <Input
              value={reqName}
              onChange={(e) => setReqName(e.target.value)}
              placeholder="John Doe"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Client Email *</label>
            <Input
              type="email"
              value={reqEmail}
              onChange={(e) => setReqEmail(e.target.value)}
              placeholder="client@example.com"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Select Project *</label>
            {projectsLoading ? (
              <div className="flex items-center gap-2 text-xs text-gray-600 py-2">
                <Spinner size="sm" /> Loading projects...
              </div>
            ) : (
              <Select value={reqSlug} onValueChange={setReqSlug}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Choose a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.slug} value={p.slug}>
                      {p.title}{p.client ? ` — ${p.client}` : ''}
                    </SelectItem>
                  ))}
                  {projects.length === 0 && (
                    <SelectItem value="" disabled>No projects found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="sm:col-span-2">
            <Button
              type="button"
              onClick={sendReviewRequest}
              disabled={reqBusy || !reqEmail.trim() || !reqName.trim() || !reqSlug}
              className="gap-2"
            >
              {reqBusy
                ? <><Spinner size="sm" variant="dark" /> Sending...</>
                : <><Send className="w-4 h-4" /> Send Review Request</>
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Testimonials Approval
          </h2>
          <p className="text-sm text-gray-900 mt-0.5">
            Approve reviews before they appear on the public site.
          </p>
        </div>

        {/* Summary chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full !bg-primary-50 px-3 py-1 text-xs font-medium !text-primary">
              <Clock className="w-3 h-3" />
              {pendingCount} pending
            </span>
          )}
          {approvedCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full !bg-primary-100 px-3 py-1 text-xs font-medium !text-primary">
              <CheckCircle2 className="w-3 h-3" />
              {approvedCount} approved
            </span>
          )}
        </div>
      </div>

      {/* ── Filter tabs ── */}
      {totalCount > 0 && (
        <div className="flex items-center gap-1 p-1 rounded-xl bg-primary-100 w-fit">
          {filterButtons.map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-slate-500 hover:text-gray-700'
              }`}
            >
              <Filter className="w-3 h-3 min-[320px]:max-[500px]:hidden" />
              {label}
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
      {totalCount === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-14 text-gray-900">
            <MessageSquare className="w-8 h-8 opacity-30" />
            <span className="text-sm">No testimonials yet.</span>
            <span className="text-xs text-gray-600">Send a review request above to get started.</span>
          </CardContent>
        </Card>
      )}

      {/* ── Filtered empty ── */}
      {totalCount > 0 && filtered.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-gray-900 text-sm">
            No {filter} testimonials.
          </CardContent>
        </Card>
      )}

      {/* ── Review cards ── */}
      <div className="space-y-3">
        {filtered.map((review) => {
          const isBusy = busyId === review._id;

          return (
            <Card
              key={review._id}
              className={`transition-all ${
                review.approved
                  ? 'border-green-100 bg-green-50/20'
                  : 'border-yellow-100 bg-yellow-50/20'
              }`}
            >
              <CardContent className="!p-5">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                  {/* ── Left: Review info ── */}
                  <div className="flex-1 min-w-0">

                    {/* Name + badge */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-gray-900">{review.name}</h3>
                      <Badge variant={review.approved ? 'default' : 'secondary'} className="text-[11px] bg-">
                        {review.approved ? (
                          <><CheckCircle2 className="w-3 h-3 mr-1" />Approved</>
                        ) : (
                          <><Clock className="w-3 h-3 mr-1" />Pending</>
                        )}
                      </Badge>
                    </div>

                    {/* Meta: role · company · stars */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2.5">
                      <span className="text-xs text-gray-600">
                        {review.role || 'Client'} · {review.company}
                      </span>
                      <StarRating rating={review.rating} />
                    </div>

                    {/* Review text */}
                    <p className="text-sm text-gray-900 leading-relaxed text-justify">
                      &ldquo;{review.review}&rdquo;
                    </p>
                  </div>

                  {/* ── Right: Action buttons ── */}
                  <div className="flex flex-col gap-2 min-w-[160px] lg:pl-4">

                    {/* Approve (disabled if already approved) */}
                    <Button
                      type="button"
                      size="sm"
                      className="w-full justify-center gap-1.5"
                      disabled={isBusy || review.approved}
                      onClick={() => setApproval(review._id, true)}
                    >
                      {isBusy && !review.approved ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      {review.approved ? 'Approved' : 'Approve'}
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Hide */}
                      <Button
                        type="button"
                        size="sm"
                        className="justify-center gap-1"
                        disabled={isBusy || !review.approved}
                        onClick={() => setApproval(review._id, false)}
                      >
                        {isBusy && review.approved ? (
                          <span className="w-3 h-3 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                        Hide
                      </Button>

                      {/* Delete */}
                      <Button
                        type="button"
                        size="sm"
                        variant='destructive'
                        className="justify-center gap-1 "
                        disabled={isBusy}
                        onClick={() => handleDelete(review)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
