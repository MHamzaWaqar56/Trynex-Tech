
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Star, Send, CheckCircle2, XCircle,
  MessageSquare, User, Building2, Briefcase,
  ShieldCheck, Clock, Lock,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

type Status = 'loading' | 'valid' | 'invalid' | 'expired' | 'used' | 'submitted';
type TokenInfo = { clientName: string; projectTitle: string };

const trustPoints = [
  { icon: ShieldCheck, text: 'Your review will be published on our website after submission.' },
  { icon: Lock,        text: 'Your personal information is kept private' },
  { icon: Clock,       text: 'Takes less than 2 minutes to complete' },
];

function ReviewForm() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';

  const [status,    setStatus]    = useState<Status>('loading');
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [form,      setForm]      = useState({
    name: '', company: '', role: '', rating: 5, review: '', service: '',
  });
  const [busy, setBusy] = useState(false);

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

  const handleSubmit = async () => {
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Error states
  if (status !== 'valid' && status !== 'submitted') {
    const messages: Record<string, { title: string; desc: string }> = {
      invalid: { title: 'Invalid Link',       desc: 'This review link is not valid. Please contact Trynex Tech for a new one.' },
      expired: { title: 'Link Expired',       desc: 'This review link has expired. Links are valid for 7 days. Please ask Trynex Tech to send a new one.' },
      used:    { title: 'Already Submitted',  desc: 'This review link has already been used. Each link can only be used once. Thank you for your review!' },
    };
    const msg = messages[status] || messages.invalid;
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 pt-28">
        <div className="max-w-md w-full text-center">
          <div className="glass-card p-10">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <div className="section-badge mb-4 justify-center inline-flex">
              <span className="w-2 h-2 rounded-full bg-red-50" />
              {msg.title}
            </div>
            <h1 className="text-xl font-display font-bold text-gray-900 mb-3">{msg.title}</h1>
            <p className="text-gray-600 text-sm leading-relaxed">{msg.desc}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Success
  if (status === 'submitted') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 pt-28">
        <div className="max-w-md w-full text-center">
          <div className="glass-card p-10">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-primary-600" />
            </div>
            <div className="section-badge mb-4 justify-center inline-flex">
              <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
              Review Submitted
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-3">
              Thank You, {tokenInfo?.clientName}!
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Your review for <strong className="text-gray-900">{tokenInfo?.projectTitle}</strong> has
              been submitted. Our team will review and publish it shortly.
            </p>
            <div className="flex justify-center gap-1">
              {Array.from({ length: form.rating }).map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-primary text-primary" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Valid Form
  return (
    <div className="min-h-screen bg-white">

      <section className="py-12 pt-28">
        <div className="container-custom">

          {/* Section header — same pattern as ContactFormSection */}
          <div className="mb-4">
            <span className="section-badge">
              <MessageSquare className="h-3.5 w-3.5" />
              Client Review
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <h2 className="section-title">
              Share Your <span className="gradient-text">Experience</span>
            </h2>
            <p className="text-gray-900 text-base max-w-sm">
              Hi <strong>{tokenInfo?.clientName}</strong>! Your honest feedback about{' '}
              <strong>{tokenInfo?.projectTitle}</strong> means a lot to us.
            </p>
          </div>

          {/* 2-column layout — same as ContactFormSection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* LEFT — Info panel */}
            <div className="space-y-5 min-[320px]:max-[767px]:hidden">

              {/* Project card */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-mono uppercase tracking-wider">Project</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{tokenInfo?.projectTitle}</p>
                  </div>
                </div>
                <div className="h-px bg-primary-100 mb-4" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your feedback helps us grow and helps other businesses make informed
                  decisions. We appreciate you taking a few minutes to share your experience.
                </p>
              </div>

              {/* Trust points */}
              <div className="glass-card p-6">
                <h3 className="text-sm font-display font-bold text-gray-900 mb-4">
                  What happens after you submit?
                </h3>
                <div className="space-y-4">
                  {trustPoints.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live rating preview */}
              <div className="glass-card p-6">
                <p className="text-xs font-mono text-gray-900 uppercase tracking-wider mb-3">
                  Your current rating
                </p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-7 h-7 transition-all duration-200 ${
                      s <= form.rating ? 'fill-primary text-primary' : 'text-primary '
                    }`} />
                  ))}
                  <span className="ml-2 text-sm font-bold text-gray-900">{form.rating}/5</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {['', 'Needs Improvement', 'Fair', 'Good', 'Great!', 'Excellent! 🎉'][form.rating]}
                </p>
              </div>

            </div>

            {/* RIGHT — Form */}
            <div className="glass-card p-8 space-y-6">

              {/* Star Rating */}
              <div>
                <label className="block text-sm text-gray-900 mb-3 font-medium">
                  Your Rating <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button"
                      onClick={() => setForm((f) => ({ ...f, rating: star }))}
                      className="transition-all duration-150 hover:scale-110 active:scale-95">
                      <Star className={`w-9 h-9 transition-colors duration-150 ${
                        star <= form.rating
                          ? 'fill-primary text-primary'
                          : 'text-gray-200 fill-gray-100 hover:text-primary/40'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm text-gray-900 mb-2 font-medium">
                  Your Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                  <input type="text" required value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
              </div>

              {/* Company + Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-900 mb-2 font-medium">
                    Company <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                    <input type="text" required value={form.company}
                      onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                      placeholder="Your Company"
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary/50 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-900 mb-2 font-medium">
                    Role <span className="text-gray-600 text-xs">(optional)</span>
                  </label>
                  <input type="text" value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    placeholder="CEO, Manager..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
              </div>

              {/* Review textarea */}
              <div>
                <label className="block text-sm text-gray-900 mb-2 font-medium">
                  Your Review <span className="text-red-400">*</span>
                </label>
                <textarea required rows={5} value={form.review}
                  onChange={(e) => setForm((f) => ({ ...f, review: e.target.value }))}
                  placeholder="Share your experience — what problem did we solve, how was the process, would you recommend us?"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary/50 transition-colors resize-none" />
                <p className="text-xs text-gray-600 mt-1">{form.review.length} characters</p>
              </div>

              {/* Submit */}
              <button type="button" onClick={handleSubmit}
                disabled={busy || !form.review.trim() || !form.name.trim() || !form.company.trim()}
                className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed">
                {busy
                  ? <><Spinner size="sm" variant="dark" /> Submitting...</>
                  : <><Send className="w-4 h-4" /> Submit Review</>
                }
              </button>

              <p className="text-xs text-gray-600 text-center">
                By submitting, you agree that your review may be published on our website.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    }>
      <ReviewForm />
    </Suspense>
  );
}