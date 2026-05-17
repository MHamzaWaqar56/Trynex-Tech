
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AppButton from '@/components/shared/AppButton';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';
import { NAV_LINKS } from '@/lib/data';
import { cn } from '@/lib/utils';

const ABOUT_SECTIONS = [
  { label: 'Overview', href: '/about' },
  { label: 'Who We Are', href: '/about#who-we-are' },
  { label: 'Why Choose Us', href: '/about#why-choose-us' },
  { label: 'Our Values', href: '/about#our-values' },
  { label: 'How We Work', href: '/about#how-we-work' },
  { label: 'Our CEO', href: '/about#ceo-intro' },
  { label: 'Our Team', href: '/about#our-team' },
  { label: 'FAQ', href: '/about#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aboutMobileOpen, setAboutMobileOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const updateHash = () => setActiveHash(window.location.hash || '');

    updateHash();
    window.addEventListener('hashchange', updateHash);
    window.addEventListener('popstate', updateHash);

    return () => {
      window.removeEventListener('hashchange', updateHash);
      window.removeEventListener('popstate', updateHash);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      setAboutMobileOpen(false);
    }
  }, [mobileOpen]);

  const isAdmin = pathname?.startsWith('/admin') ?? false;
  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isAdmin || scrolled ? 'bg-dark backdrop-blur-md shadow-lg shadow-black/20' : 'bg-dark/0'
        )}
      >
        <nav className="container-custom flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/Trynex-Logo.png"
              alt="Trynex Tech"
              width={180}
              height={78}
              priority
              className="h-[3.5rem] w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => {
              if (link.href === '/about') {
                const isActive = pathname === '/about';

                return (
                  <li key={link.href} className="relative group">
                    <Link href="/about" className="relative flex flex-col items-center gap-1 py-1 group/link">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'text-[16px] font-medium transition-colors duration-200',
                            isActive
                              ? 'text-white font-semibold'
                              : 'text-white group-hover:text-white'
                          )}
                        >
                          {link.label}
                        </span>
                        <ChevronDown className="h-4 w-4 text-white/70 transition-transform duration-200 group-hover:translate-y-0.5" />
                      </span>
                      <span
                        className={cn(
                          'h-[3px] rounded-full bg-primary transition-all duration-300',
                          isActive ? 'w-full' : 'w-0 group-hover/link:w-full'
                        )}
                      />
                    </Link>

                    <div className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-3 opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto">
                      <div className="overflow-hidden rounded-2xl border border-white/10 bg-dark/95 p-2 shadow-2xl shadow-black/30 backdrop-blur-md">
                        {ABOUT_SECTIONS.map((section) => (
                          <Link
                            key={section.href}
                            href={section.href}
                            className={cn(
                              'block rounded-xl px-4 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white'
                            )}
                          >
                            {section.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              }

              const isActive = pathname === link.href;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="relative flex flex-col items-center gap-1 py-1 group"
                  >
                    <span
                      className={cn(
                        'text-[16px] font-medium transition-colors duration-200',
                        isActive
                          ? 'text-white font-semibold'
                          : 'text-white group-hover:text-white'
                      )}
                    >
                      {link.label}
                    </span>
                    <span
                      className={cn(
                        'h-[3px] rounded-full bg-primary transition-all duration-300',
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center">
            <AppButton href="/consultation" variant="primary" className="!px-5 !py-2.5 !text-sm">
               Book Free Consultation
            </AppButton> 
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-primary hover:text-primary/80  transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden transition-all duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            'absolute top-16 right-0 h-[calc(100vh-4rem)] w-[88vw] max-w-sm overflow-y-auto overscroll-contain  border-l border-gray-100 bg-white p-6 shadow-2xl transition-transform duration-300',
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <ul className="flex flex-col gap-1 mb-6">
            {NAV_LINKS.map((link) => {
              const isAbout = link.href === '/about';
              const isActive = pathname === link.href;

              if (isAbout) {
                return (
                  <li key={link.href} className="relative rounded-lg">
                    <div className="flex items-center gap-2">
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex min-w-0 flex-1 items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all',
                          isActive
                            ? 'text-primary bg-primary/5 font-semibold'
                            : 'text-gray-900 hover:text-gray-900 hover:bg-gray-100'
                        )}
                      >
                        <span className="truncate">{link.label}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </Link>

                      <button
                        type="button"
                        onClick={() => setAboutMobileOpen((open) => !open)}
                        className={cn(
                          'flex h-10 w-10 items-center justify-center transition-colors',
                          aboutMobileOpen
                            ? ' text-primary'
                            : ' text-gray-700 hover:text-gray-900'
                        )}
                        aria-label={aboutMobileOpen ? 'Collapse About submenu' : 'Expand About submenu'}
                        aria-expanded={aboutMobileOpen}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                    {aboutMobileOpen && (
                      <div className="mt-1 ml-3  pl-3 pb-1">
                        <div className="flex flex-col gap-1">
                          {ABOUT_SECTIONS.map((section) => {
                            return (
                              <Link
                                key={section.href}
                                href={section.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                  'flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-gray-900 transition-all hover:text-gray-900 hover:bg-gray-100'
                                )}
                              >
                                <span className="truncate">{section.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </li>
                );
              }

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all',
                      isActive
                        ? 'text-primary bg-primary/5 font-semibold'
                        : 'text-gray-900 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/consultation"
            className="bg-primary text-white text-sm font-semibold px-5 py-3 rounded-lg w-full flex items-center justify-center"
            style={{ boxShadow: '0 4px 20px rgba(0,212,255,0.3)' }}
          >
            Book Free Consultation
          </Link>
        </div>
      </div>
    </>
  );
}