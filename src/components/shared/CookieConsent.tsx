'use client';

import { useEffect, useState } from 'react';
import { Cookie, X, ShieldCheck } from 'lucide-react';

type ConsentStatus = 'pending' | 'accepted' | 'declined';

export default function CookieConsent() {
  const [status, setStatus] = useState<ConsentStatus | null>(null);

  const notifyConsentChange = (nextStatus: ConsentStatus) => {
    window.dispatchEvent(
      new CustomEvent('cookie-consent-changed', {
        detail: { status: nextStatus },
      })
    );
  };

  useEffect(() => {
    const saved = localStorage.getItem('cookie_consent') as ConsentStatus | null;
    if (saved === 'accepted' || saved === 'declined') {
      setStatus(saved);
    } else {
      // Small delay so banner doesn't flash on first paint
      const t = setTimeout(() => setStatus('pending'), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setStatus('accepted');
    notifyConsentChange('accepted');
    // Fire GA now that consent is given
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setStatus('declined');
    notifyConsentChange('declined');
  };

  // Not mounted or already decided
  if (status !== 'pending') return null;

  return (
    <div
      className={`
        fixed bottom-6 left-4 right-4 z-[60]
        sm:left-auto sm:right-6 sm:max-w-sm
        transition-all duration-500 ease-out
        animate-fade-up
      `}
    >
      <div
        className="glass-card rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        style={{ borderColor: 'rgba(0,212,255,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-display font-bold text-gray-900">
              Cookie Consent
            </span>
          </div>
          <button
            type="button"
            onClick={handleDecline}
            aria-label="Decline cookies"
            className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0 mt-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-primary/10 mb-3" />

        {/* Message */}
        <p className="text-xs text-gray-600 leading-relaxed mb-4">
          We use{' '}
          <span className="text-primary font-semibold">Google Analytics</span>{' '}
          to understand how visitors interact with our website. No personal data
          is sold or shared. You can opt out at any time.
        </p>

        {/* Privacy note */}
        <div className="flex items-center gap-1.5 mb-4">
          <ShieldCheck className="w-3 h-3 text-primary shrink-0" />
          <span className="text-[10px] text-gray-400">
            Your data is protected under our{' '}
            <a href="/privacy" className="text-primary hover:underline underline-offset-2">
              Privacy Policy
            </a>
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAccept}
            className="btn-primary flex-1 justify-center py-2.5 text-xs"
          >
            Accept All
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="btn-secondary flex-1 justify-center py-2.5 text-xs"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}