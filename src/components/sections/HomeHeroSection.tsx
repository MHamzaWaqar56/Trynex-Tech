
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play } from 'lucide-react';
import AppButton from '@/components/shared/AppButton';

// ── Types
type HeroStats = {
  projectsCompleted: number;
  happyClients: number;
};

// ── Fetch stats from DB (same API as StatsSection)
async function fetchHeroStats(): Promise<HeroStats> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/admin/stats`, {
      next: { revalidate: 3600 }, // 1 hour cache — same as StatsSection
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    const data = await res.json();
    return {
      projectsCompleted: data.projectsCompleted ?? 150,
      happyClients:      data.happyClients      ?? 80,
    };
  } catch {
    // Fallback defaults if API fails
    return {
      projectsCompleted: 150,
      happyClients:      80,
    };
  }
}

export default async function HomeHeroSection() {
  const stats = await fetchHeroStats();

  return (
    <>
      {/* ══════════ HERO ══════════ */}
      <section className="relative bg-white overflow-hidden section-bottom-accent">

        {/* Dot grid — top right decoration */}
        <div
          className="absolute top-16 right-8 w-36 h-36 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, #00D4FF 1.5px, transparent 1.5px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-center min-h-screen pt-24 pb-16">

            {/* ── LEFT — Content ── */}
            <div className="animate-fade-up">

              {/* Badge */}
              <div className="section-badge mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Building Digital Futures Since 2025
              </div>

              {/* Headline */}
              <h1
                className="font-display font-[700] text-gray-900 leading-[1.08] tracking-tight mb-6"
                style={{ fontSize: 'clamp(2.2rem, 5vw, 3.30rem)' }}
              >
                We Build{' '}
                <span className="gradient-text">Digital</span>
                <br />
                <span className="gradient-text">Futures</span> That Drive
                <br />
                <span className="text-gray-900">Real Results</span>
              </h1>

              {/* Subtitle */}
              <p className="text-gray-900 text-base sm:text-lg leading-relaxed max-w-lg mb-8">
                From SEO dominance to AI-powered applications — we craft
                technology solutions that transform businesses and deliver
                measurable growth.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 animate-fade-up animation-delay-200">
                <AppButton href="/contact" variant="primary">
                  Start Your Project
                  <ArrowRight className="w-4 h-4" />
                </AppButton>
                <AppButton href="/consultation" variant="secondary">
                  <Play className="w-4 h-4 fill-current" />
                  Free Consultation
                </AppButton>
              </div>
            </div>

            {/* ── RIGHT — Device mockup ── */}
            <div className="relative flex items-center justify-center animate-fade-up animation-delay-100">

              {/* Cyan circle backdrop */}
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full pointer-events-none"
                style={{ background: 'rgba(0,212,255,0.12)' }}
              />

              {/* Dot grid — bottom right of image area */}
              <div
                className="absolute bottom-4 right-0 w-24 h-24 opacity-50 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, #00D4FF 1.5px, transparent 1.5px)',
                  backgroundSize: '14px 14px',
                }}
              />

              {/* Floating device image */}
              <div
                className="relative z-10 animate-float"
                style={{ animationDuration: '5s' }}
              >
                <Image
                  src="https://res.cloudinary.com/da8lxpc3h/image/upload/v1777787616/hero-device-img_2_ucjixk.png"
                  alt="Trynex Tech — Digital Solutions for Modern Businesses"
                  width={600}
                  height={450}
                  priority
                  className="w-full max-w-[560px] drop-shadow-2xl rounded-2xl"
                />
              </div>

              {/* ── Floating badge — top left (Projects) ── */}
              <div
                className="glass-card rounded-[100px] absolute top-12 -left-4 z-20 px-4 py-2.5 flex items-center gap-2 animate-float"
                style={{ animationDelay: '1s', animationDuration: '4s' }}
              >
                <span className="text-primary font-display font-bold text-xs leading-none">
                  {stats.projectsCompleted}+
                </span>
                <span className="text-xs font-mono text-gray-900 whitespace-nowrap">
                  Projects Delivered
                </span>
              </div>

              {/* ── Floating badge — bottom right (Clients) ── */}
              <div
                className="glass-card rounded-[100px] absolute bottom-12 -right-2 z-20 px-4 py-2.5 flex items-center gap-2 animate-float"
                style={{ animationDelay: '2s', animationDuration: '4.5s' }}
              >
                <span className="text-primary font-display font-bold text-xs leading-none">
                  {stats.happyClients}+
                </span>
                <span className="text-xs text-gray-900">Happy Clients</span>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}