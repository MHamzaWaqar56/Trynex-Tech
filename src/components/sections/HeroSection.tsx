
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import AppButton from '@/components/shared/AppButton';
import { connectDB } from '@/lib/db';
import { SiteStats } from '@/models/SiteStats';

type HeroStats = {
  projectsCompleted: number;
  happyClients: number;
};

async function fetchHeroStats(): Promise<HeroStats> {
  await connectDB();
  const stats = await SiteStats.findOne({ key: 'main' });
  return {
    projectsCompleted: stats?.projectsCompleted,
    happyClients: stats?.happyClients,
  };
}

export default async function HeroSection() {
  const stats = await fetchHeroStats();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://res.cloudinary.com/da8lxpc3h/image/upload/v1778481788/home-hero-bg_goijrl.png')",
        }}
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: '#0c1324a1' }}
      />

      <div className="container-custom relative z-10 py-24">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 section-badge mb-8 animate-fade-up">
            Your Vision, Engineered to Perform.
          </div>

          {/* Floating badge — top left (Projects) */}
          <div
            className="glass-card rounded-[100px] absolute top-20 -left-4 z-20 px-4 py-2.5 flex items-center gap-2 animate-float min-[320px]:max-[767px]:left-[2rem] min-[320px]:max-[767px]:top-[2rem]"
            style={{ animationDelay: '1s', animationDuration: '4s' }}
          >
            <span className="text-primary font-display font-bold text-xs leading-none">
              {stats.projectsCompleted}+
            </span>
            <span className="text-xs font-mono text-gray-900 whitespace-nowrap">
              Projects Delivered
            </span>
          </div>

          {/* Floating badge — bottom right (Clients) */}
          <div
            className="glass-card rounded-[100px] absolute bottom-20 -right-2 z-20 px-4 py-2.5 flex items-center gap-2 animate-float min-[320px]:max-[767px]:bottom-[2rem] min-[320px]:max-[767px]:right-[2rem]"
            style={{ animationDelay: '2s', animationDuration: '4.5s' }}
          >
            <span className="text-primary font-display font-bold text-xs leading-none">
              {stats.happyClients}+
            </span>
            <span className="text-xs text-gray-900">Happy Clients</span>
          </div>

          {/* Headline */}
          <h1
            className="font-display font-[700] leading-[1.1] tracking-tight text-white mb-6 animate-fade-up animation-delay-100"
            style={{ fontSize: 'clamp(2.0rem, 6vw, 3.30rem)' }}
          >
            We Build{' '}
            <span className="gradient-text">Digital Futures</span>
            <br />
            That Drive{' '}
            <span className="relative inline-block">
              Real Results
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 300 10"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 7C60 2 180 1 298 7"
                  stroke="#00D4FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-white text-lg leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-up animation-delay-200 min-[320px]:max-[767px]:text-[1rem]"
          >
            From SEO dominance to AI-powered applications — we craft technology solutions
            that transform businesses and deliver measurable growth.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-up animation-delay-300">
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
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #0C1324, transparent)' }}
      />

    </section>
  );
}