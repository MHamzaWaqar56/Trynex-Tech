'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Linkedin, Github, ArrowRight, Send } from 'lucide-react';
import { SITE_NAME, WHATSAPP_NUMBER } from '@/lib/data';
import { toast } from 'sonner';

type FooterService = { title: string; slug: string };

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
    <footer className="bg-[#111827] text-white">

      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center mb-5 min-[320px]:max-[767px]:justify-center">
              <Image
                src="/trynex-logo.png"
                alt="Trynex Tech"
                width={130}
                height={57}
                className="h-8 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-white text-sm leading-relaxed mb-6 min-[320px]:max-[767px]:text-center">
              Transforming businesses through cutting-edge technology solutions — SEO, Web Development, Data Science & AI.
            </p>
            <div className="flex items-center gap-3 min-[320px]:max-[767px]:justify-center">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
                { icon: Github, href: 'https://github.com/MHamzaWaqar56/', label: 'GitHub' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-5 min-[320px]:max-[767px]:text-center">
              Services
            </h3>
            <ul className="space-y-3 min-[320px]:max-[767px]:flex min-[320px]:max-[767px]:flex-col min-[320px]:max-[767px]:items-center">
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
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-5 min-[320px]:max-[767px]:text-center">
              Quick Links
            </h3>
            <ul className="space-y-3 min-[320px]:max-[767px]:flex min-[320px]:max-[767px]:flex-col min-[320px]:max-[767px]:items-center">
              {[
                { label: 'Free Consultation', href: '/consultation' },
                { label: 'Portfolio', href: '/portfolio' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'About Us', href: '/about' },
                { label: 'Careers', href: '/careers' },
                { label: 'Contact', href: '/contact' },
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

          {/* Contact + Newsletter */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-5 min-[320px]:max-[767px]:text-center">
              Contact Us
            </h3>
            <ul className="space-y-3 mb-6 min-[320px]:max-[767px]:flex min-[320px]:max-[767px]:flex-col min-[320px]:max-[767px]:items-center">
              <li className="hover:text-primary">
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
              <li className="flex items-start gap-3 text-sm text-white hover:text-primary">
                <MapPin className="w-4 h-4 mt-0.5 text-white shrink-0" />
                Chichawatni, Pakistan
              </li>
            </ul>

            
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="">
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