'use client';

import { useState } from 'react';
import {
  Star, Trash2, CheckCircle2, EyeOff,
  MessageSquare, Clock, Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
          className={`w-3.5 h-3.5 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
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
    <div className="flex flex-col gap-4 p-5">

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
              <Filter className="w-3 h-3" />
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
            <span className="text-xs text-gray-600">They will appear here once clients submit reviews.</span>
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
                    <p className="text-sm text-gray-900 leading-relaxed">
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