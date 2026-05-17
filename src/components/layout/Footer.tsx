'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Linkedin, Github, Instagram, Twitter, ArrowRight, Send } from 'lucide-react';
import { SITE_NAME, WHATSAPP_NUMBER } from '@/lib/data';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

type FooterService = { title: string; slug: string };

// ── Social links from env variables
const SOCIAL_LINKS = [
  {
    icon: Facebook,
    href: process.env.NEXT_PUBLIC_FACEBOOK_URL || '#',
    label: 'Facebook',
  },
  {
    icon: Linkedin,
    href: process.env.NEXT_PUBLIC_LINKEDIN_URL || '#',
    label: 'LinkedIn',
  },
  {
    icon: Instagram,
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '#',
    label: 'Instagram',
  },
  {
    icon: Github,
    href: 'https://github.com/MHamzaWaqar56/',
    label: 'GitHub',
  },
  {
    icon: Github,
    href: 'https://github.com/MHamzaWaqar56/',
    label: 'GitHub',
  },
].filter((s) => s.href); // ── Only show if URL is set

export default function Footer({ dbServices = [] }: { dbServices?: FooterService[] }) {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
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
        toast.error(data?.error || 'Subscription failed. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-dark text-white">

      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center mb-5 ">
              <Image
                src="/Trynex-Logo.png"
                alt="Trynex Tech"
                width={130}
                height={57}
                className="h-16 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-white text-sm leading-relaxed mb-6 min-[320px]:max-[767px]:text-justify">
              Transforming businesses through cutting-edge technology solutions — SEO, Web Development, Data Science & AI.
            </p>

            {/* Social links — only rendered if URL is set in env */}
            {SOCIAL_LINKS.length > 0 && (
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-white hover:bg-primary/80 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-5 min-[320px]:max-[767px]:text-[20px]">
              Services
            </h3>
            <ul className="space-y-3 min-[320px]:max-[767px]:flex min-[320px]:max-[767px]:flex-col ">
              {dbServices.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="text-sm text-white hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 text-primary group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {s.title}
                  </Link>
                </li>
              ))}
              {dbServices.length === 0 && (
                <li className="text-sm text-white">No services found</li>
              )}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-5 min-[320px]:max-[767px]:text-[20px]">
              Quick Links
            </h3>
            <ul className="space-y-3 min-[320px]:max-[767px]:flex min-[320px]:max-[767px]:flex-col ">
              {[
                { label: 'Free Consultation', href: '/consultation' },
                { label: 'Portfolio',          href: '/portfolio'    },
                { label: 'Pricing',            href: '/pricing'      },
                { label: 'About Us',           href: '/about'        },
                { label: 'Careers',            href: '/careers'      },
                { label: 'Contact',            href: '/contact'      },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 text-primary group-hover:translate-x-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-5 min-[320px]:max-[767px]:text-[20px]">
              Contact Us
            </h3>
            <ul className="space-y-3 mb-6 min-[320px]:max-[767px]:flex min-[320px]:max-[767px]:flex-col ">
              <li>
                <a
                  href="mailto:trynextech@gmail.com"
                  className="flex items-start gap-3 text-sm text-white hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4 mt-0.5 text-white shrink-0" />
                  trynextech@gmail.com
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-white hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 mt-0.5 text-white shrink-0" />
                  {WHATSAPP_NUMBER}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white">
                <MapPin className="w-4 h-4 mt-0.5 text-white shrink-0" />
                Chichawatni, Pakistan
              </li>
            </ul>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="space-y-2">
              {/* <p className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-3">Newsletter</p> */}
              <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-2 min-[320px]:max-[767px]:text-[20px]">
              Newsletter
            </h3>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                disabled={subscribing}
                className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary/60 transition-colors disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="btn-primary w-full justify-center text-sm py-2.5 disabled:opacity-60 gap-2"
              >
                {subscribing
                  ? <><Spinner size="sm" variant="dark" /> Subscribing...</>
                  : <><Send className="w-3.5 h-3.5" /> Subscribe</>
                }
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div>
        <div className="container-custom py-5 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-white">
            © {year} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-sm text-white hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-white hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

    </footer>
  );
}