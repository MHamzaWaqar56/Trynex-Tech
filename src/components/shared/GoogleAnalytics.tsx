'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GoogleAnalytics() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  const [consented, setConsented] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const check = () => {
      const consent = localStorage.getItem('cookie_consent');
      setConsented(consent === 'accepted');
    };

    const handleConsentChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ status?: string }>;
      if (customEvent.detail?.status) {
        setConsented(customEvent.detail.status === 'accepted');
        return;
      }

      check();
    };

    check();

    // Listen for consent change (when user clicks Accept in banner)
    window.addEventListener('storage', check);
    window.addEventListener('cookie-consent-changed', handleConsentChange);
    return () => {
      window.removeEventListener('storage', check);
      window.removeEventListener('cookie-consent-changed', handleConsentChange);
    };
  }, []);

  useEffect(() => {
    if (!GA_ID || !consented || !pathname || typeof window === 'undefined' || !(window as any).gtag) {
      return;
    }

    (window as any).gtag('config', GA_ID, {
      page_path: pathname,
    });
  }, [GA_ID, consented, pathname]);

  if (!GA_ID || !consented) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'default', {
            analytics_storage: 'granted'
          });
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}