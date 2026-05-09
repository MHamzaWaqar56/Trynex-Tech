'use client';

import { useState } from 'react';
import { Mail, Sparkles, ArrowRight, CheckCircle2, Zap, Shield, Bell } from 'lucide-react';
import { toast } from 'sonner';

const perks = [
  { icon: Zap, label: 'Weekly Tech Insights' },
  { icon: Shield, label: 'No Spam, Ever' },
  { icon: Bell, label: 'Early Access to Blogs' },
];

export default function BlogsNewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setSubscribed(true);
        toast.success('Successfully subscribed!');
        setEmail('');
      } else {
        toast.error(data?.error || 'Subscription failed. Try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        {/* Outer wrapper with gradient border effect */}
        <div
          className="relative border border-primary rounded-3xl overflow-hidden"
          
        >
          {/* Inner card */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #f0fdff 0%, #e8f4ff 50%, #f0f9ff 100%)',
            }}
          >
            {/* Decorative background blobs */}
            <div
              className="absolute top-0 right-0 w-[420px] h-[420px] opacity-[0.08] pointer-events-none"
              style={{
                background: 'radial-gradient(circle, #00D4FF 0%, transparent 70%)',
                transform: 'translate(30%, -30%)',
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-[300px] h-[300px] opacity-[0.06] pointer-events-none"
              style={{
                background: 'radial-gradient(circle, #0080FF 0%, transparent 70%)',
                transform: 'translate(-30%, 30%)',
              }}
            />

            {/* Dot grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, #0080FF 1px, transparent 1px)`,
                backgroundSize: '28px 28px',
              }}
            />

            <div className="relative z-10 px-8 py-14 md:px-14 lg:px-20">
              <div className="max-w-3xl mx-auto text-center">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-semibold uppercase tracking-widest text-primary border border-primary/30 bg-primary/5">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Newsletter
                </div>

                {/* Heading */}
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-dark leading-tight mb-4">
                  Stay Ahead of the{' '}
                  <span className="gradient-text">Tech Curve</span>
                </h2>

                <p className="text-gray-900 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
                  Get expert insights on Web Development, AI, SEO, and Data Science — delivered straight to your inbox every week.
                </p>

                {/* Perks */}
                <div className="flex flex-wrap justify-center gap-4 mb-10 min-[320px]:max-[767px]:hidden">
                  {perks.map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 text-sm font-medium text-dark bg-white/80 border border-primary/15 rounded-full px-4 py-2 shadow-sm"
                    >
                      <Icon className="w-4 h-4 text-primary" />
                      {label}
                    </div>
                  ))}
                </div>

                {/* Form or Success State */}
                {subscribed ? (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-primary" />
                    </div>
                    <p className="font-display font-bold text-xl text-dark">You're subscribed!</p>
                    <p className="text-sm text-gray-900">Watch your inbox — great content is on its way.</p>
                    <button
                      onClick={() => setSubscribed(false)}
                      className="mt-2 text-xs text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                    >
                      Subscribe another email
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                  >
                    <div className="relative flex-1">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        disabled={loading}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-primary/30 bg-white text-sm text-dark placeholder:text-dark-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all disabled:opacity-60 shadow-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary px-6 py-3.5 rounded-xl shrink-0 text-sm font-semibold disabled:opacity-60 min-[320px]:max-[767px]:justify-center"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Subscribing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Subscribe
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </button>
                  </form>
                )}

                {/* Privacy note */}
                {!subscribed && (
                  <p className="mt-4 text-xs text-dark-muted/70">
                    No spam. Unsubscribe anytime. Your privacy is protected.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}