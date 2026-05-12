
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AppButton from '@/components/shared/AppButton';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '@/lib/data';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50  transition-all duration-300',
          scrolled ? ' bg-dark  shadow-lg' : 'bg-dark'
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
                    {/* Underline indicator */}
                    <span
                      className={cn(
                        'h-[3px] rounded-full bg-primary transition-all duration-300',
                        isActive
                          ? 'w-full'
                          : 'w-0 group-hover:w-full'
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
            'absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-lg p-6 transition-transform duration-300',
            mobileOpen ? 'translate-y-0' : '-translate-y-4'
          )}
        >
          <ul className="flex flex-col gap-1 mb-6">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all',
                      isActive
                        ? 'text-primary bg-primary/5 font-semibold'
                        : 'text-gray-900 hover:text-gray-900 hover:bg-dark/10'
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