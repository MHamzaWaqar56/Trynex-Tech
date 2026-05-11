

import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import { Toaster } from '@/components/ui/sonner';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/data';
import FooterWrapper from '@/components/layout/FooterWrapper';
import GoogleAnalytics from '@/components/shared/GoogleAnalytics';
import CookieConsent from '@/components/shared/CookieConsent';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://trynextech.com';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Premium Software House`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
  keywords: ['software house', 'SEO services', 'web development', 'data science', 'AI solutions', 'Pakistan'],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Premium Software House`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Premium Software House`,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-white text-gray-900 font-body antialiased">
        <GoogleAnalytics />
        <Navbar />
        <main>{children}</main>
        <FooterWrapper />
        <WhatsAppButton />
        <CookieConsent />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}