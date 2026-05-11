

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, ArrowRight, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Invalid email or password.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white pt-[75px]">

      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-[#F8FAFC]">

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300D4FF' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E")`,
          }}
        />

        {/* Glow orb */}
        <div className="absolute top-1/3 -left-16 w-64 h-64 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="text-gray-900 font-display font-bold tracking-tight">Trynex Tech</span>
        </div>

        {/* Main message */}
        <div className="relative z-10 space-y-6">
          <span className="section-badge">
            <Shield className="w-3 h-3" />
            Admin Access
          </span>

          <h1 className="text-4xl xl:text-5xl font-display font-bold text-gray-900 leading-tight">
            Welcome back<br />
            <span className="gradient-text">to your dashboard</span>
          </h1>

          <p className="text-gray-900 text-base leading-relaxed max-w-sm">
            Manage your services, leads, careers, and content — all from one place.
          </p>

          <div className="space-y-3 pt-2">
            {[
              'Manage services and pricing packages',
              'Track and respond to leads',
              'Control careers and job listings',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-gray-900">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-gray-900 text-xs font-mono">
            © {new Date().getFullYear()} Trynex Tech · Restricted Access
          </p>
        </div>

        {/* Right border */}
        <div className="absolute right-0 top-16 bottom-16 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
      </div>

      {/* ── Right panel — form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative">

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="text-gray-900 font-display font-bold tracking-tight">Trynex Tech</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-1.5">Sign in</h2>
            <p className="text-gray-900 text-sm">Enter your credentials to access the admin panel.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-900 mb-2">Email Address</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@trynex.com"
                className="w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-900 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 bg-white border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg py-2.5 px-4">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Spinner size="sm" variant="dark" />
              ) : (
                <>
                  Login to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security note */}
          <p className="text-center text-xs text-gray-900 font-mono mt-6 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            Secured · Admin access only
          </p>
        </div>
      </div>
    </div>
  );
}