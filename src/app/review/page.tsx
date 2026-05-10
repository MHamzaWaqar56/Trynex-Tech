'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, Send, CheckCircle2, XCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

type Status = 'loading' | 'valid' | 'invalid' | 'expired' | 'used' | 'submitted';

type TokenInfo = {
  clientName: string;
  projectTitle: string;
};

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const token        = searchParams.get('token') || '';

  const [status,    setStatus]    = useState<Status>('loading');
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [form,      setForm]      = useState({ name: '', company: '', role: '', rating: 5, review: '', service: '' });
  const [busy,      setBusy]      = useState(false);

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }

    fetch(`/api/review?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'valid') {
          setStatus('valid');
          setTokenInfo({ clientName: data.clientName, projectTitle: data.projectTitle });
          setForm((f) => ({ ...f, name: data.clientName, service: data.service || '' }));
        } else {
          setStatus(data.status || 'invalid');
        }
      })
      .catch(() => setStatus('invalid'));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.review.trim() || !form.name.trim() || !form.company.trim()) return;
    setBusy(true);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, token }),
      });
      if (res.ok) {
        setStatus('submitted');
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || 'Submission failed. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // ── Loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Invalid / expired / used
  if (status !== 'valid' && status !== 'submitted') {
    const messages: Record<string, { title: string; desc: string }> = {
      invalid: { title: 'Invalid Link',  desc: 'This review link is not valid. Please contact Trynex Tech.' },
      expired: { title: 'Link Expired',  desc: 'This review link has expired (links are valid for 7 days). Please ask Trynex Tech to send a new one.' },
      used:    { title: 'Already Used',  desc: 'This review link has already been used. Each link can only be used once.' },
    };
    const msg = messages[status] || messages.invalid;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-display font-bold text-gray-900 mb-2">{msg.title}</h1>
          <p className="text-gray-600 text-sm">{msg.desc}</p>
        </div>
      </div>
    );
  }

  // ── Success
  if (status === 'submitted') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-display font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Your review has been submitted successfully.
          </p>
        </div>
      </div>
    );
  }

  // ── Valid form
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-16">
      <div className="max-w-lg w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">
            Share Your Experience
          </h1>
          <p className="text-gray-600 text-sm">
            Hi <strong>{tokenInfo?.clientName}</strong>! Please share your feedback about{' '}
            <strong>{tokenInfo?.projectTitle}</strong>.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-primary-200 shadow-sm p-6 space-y-5">

          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">
              Your Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, rating: star }))}
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`w-8 h-8 ${star <= form.rating ? 'fill-primary text-primary' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Your Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-gray-900 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Company + Role */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Company *</label>
              <input
                type="text"
                required
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                placeholder="Your Company"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-gray-900 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Role</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                placeholder="CEO, Manager..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-gray-900 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {/* Review */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Your Review *</label>
            <textarea
              required
              rows={4}
              value={form.review}
              onChange={(e) => setForm((f) => ({ ...f, review: e.target.value }))}
              placeholder="Share your experience working with Trynex Tech..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-gray-900 focus:outline-none focus:border-primary/50 transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy || !form.review.trim() || !form.name.trim() || !form.company.trim()}
            className="btn-primary w-full justify-center gap-2 disabled:opacity-60"
          >
            {busy
              ? <><Spinner size="sm" variant="dark" /> Submitting...</>
              : <><Send className="w-4 h-4" /> Submit Review</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}