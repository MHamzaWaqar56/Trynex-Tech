
'use client';

import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import AppButton from '@/components/shared/AppButton';
import { ArrowRight, Zap, Layers, Heart } from 'lucide-react';

type Props = {
  showCta?: boolean;
  satisfactionScore: number;
  clientRetention: number;
};

function AnimatedProgressBar({
  metric,
  percentage,
  inView,
}: {
  metric: string;
  percentage: number;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || percentage === 0) return;

    let start = 0;
    const duration = 1000; // 1 second — same as progress bar
    const steps = 60;
    const increment = percentage / steps;
    const interval = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= percentage) {
        setCount(percentage);
        clearInterval(timer);
      } else {
        setCount(Math.round(start));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [inView, percentage]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-600">{metric}</span>
        <span className="text-xs font-bold text-primary">{count}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
          style={{ width: inView ? `${percentage}%` : '0%' }}
        />
      </div>
    </div>
  );
}

export default function WhyChooseUsSection({ showCta = true, satisfactionScore, clientRetention }: Props) {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const reasons = [
    {
      icon: Zap,
      title: 'Expertise That Drives Growth',
      description:
        'We combine creative talent with data-driven strategy across web, design, marketing, and AI — every service built to grow your brand and deliver real, measurable results.',
      metric: 'Client Satisfaction',
      percentage: satisfactionScore,
    },
    {
      icon: Layers,
      title: 'All-in-One Convenience',
      description:
        'From web development and SEO to AI solutions and data science — everything under one roof. No juggling agencies, no gaps in your growth strategy.',
      metric: 'Client Retention',
      percentage: clientRetention,
    },
    {
      icon: Heart,
      title: 'Client-First Approach',
      description:
        "We treat every client's project like our own — delivering personalized strategies, transparent communication, and ongoing support that keeps you ahead.",
      metric: 'Positive Reviews',
      percentage: satisfactionScore,
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container-custom">

        {/* Header */}
        <div className="mb-4">
          <span className="section-badge">Why Choose Us</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <h2 className="section-title">
            Your{' '}
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

              {/* Progress bar with animated counter */}
              {percentage > 0 && (
                <AnimatedProgressBar
                  metric={metric}
                  percentage={percentage}
                  inView={inView}
                />
              )}
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