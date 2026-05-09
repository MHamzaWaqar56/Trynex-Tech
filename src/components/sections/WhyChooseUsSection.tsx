'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import AppButton from '@/components/shared/AppButton';
import { ArrowRight, Zap, Layers, Heart, Shield } from 'lucide-react';

const reasons = [
  {
    icon: Zap,
    title: 'Expertise That Drives Growth',
    description:
      'We combine creative talent with data-driven strategy across web, design, marketing, and AI — every service built to grow your brand and deliver real, measurable results.',
    metric: 'Growth Strategy',
    percentage: 95,
  },
  {
    icon: Layers,
    title: 'All-in-One Convenience',
    description:
      'From web development and SEO to AI solutions and data science — everything under one roof. No juggling agencies, no gaps in your growth strategy.',
    metric: 'Full-Service Support',
    percentage: 90,
  },
  {
    icon: Heart,
    title: 'Client-First Approach',
    description:
      "We treat every client's project like our own — delivering personalized strategies, transparent communication, and ongoing support that keeps you ahead.",
    metric: 'Client Satisfaction',
    percentage: 98,
  },
];

function AnimatedBar({ percentage, inView }: { percentage: number; inView: boolean }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => setWidth(percentage), 200);
      return () => clearTimeout(timer);
    }
  }, [inView, percentage]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-slate-400 font-mono"></span>
        <span className="text-xs font-bold text-primary font-mono">{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

type Props = { showCta?: boolean };

export default function WhyChooseUsSection({ showCta = true }: Props) {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section className="py-12 bg-white">
      <div className="container-custom">

        {/* Header */}
<div className="mb-4">
  <span className="section-badge">Why Choose Us</span>
</div>
<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
  <h2 className="section-title">
    Your {' '}
    <span className="gradient-text">Business Success</span>
  </h2>
  <p className="text-gray-900 text-base max-w-sm">
    We deliver more than services — we deliver results. Here is why businesses trust Trynex Tech.
  </p>
</div>

        {/* Cards */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {reasons.map(({ icon: Icon, title, description, metric, percentage }) => (
            <div
              key={title}
              className="portfolio-card group flex flex-col gap-5 p-8 rounded-2xl bg-white"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
              </div>

              {/* Title */}
              <h3 className="font-display font-bold text-lg text-gray-900 leading-tight">
                {title}
              </h3>

              {/* Description */}
              <p className="text-gray-900 text-sm leading-relaxed flex-1 text-justify">
                {description}
              </p>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-400">{metric}</span>
                  <span className="text-xs font-bold text-primary">{percentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: inView ? `${percentage}%` : '0%' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        {showCta && (
          <div className="text-center">
            <AppButton href="/about" variant="primary">
               Find Out More
              <ArrowRight className="w-4 h-4" />
            </AppButton> 
          </div>
        )}

      </div>
    </section>
  );
}