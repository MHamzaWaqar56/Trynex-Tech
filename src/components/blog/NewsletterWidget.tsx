'use client';

import { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '../ui/spinner';

export default function NewsletterWidget() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="glass-card p-5">
      {/* Icon + heading */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Mail className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-display font-bold text-gray-900 text-base">Newsletter Signup</h3>
      </div>
      <p className="text-sm text-gray-900 mb-4 mt-1">
        Get the latest tech insights delivered to your inbox.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          disabled={loading}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-60 bg-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center text-sm py-2.5 disabled:opacity-60"
        >
           {loading
            ? <><Spinner size="sm" variant="dark" /> Subscribing...</>
            : <><ArrowRight className="w-4 h-4" /> Subscribe</>
          }
        </button>
      </form>
    </div>
  );
}