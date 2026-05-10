
'use client';

import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { Spinner } from '../ui/spinner';

type Testimonial = {
  _id?: string;
  name: string;
  company: string;
  role?: string;
  rating: number;
  review: string;
  service?: string;
};

function TestimonialCard({ t }: { t: Testimonial }) {
  const initials = t.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  const firstWord = t.service ? t.service.split(' ')[0] : '';

  return (
    <div className="glass-card-hover flex flex-col p-6 gap-4 w-[320px] shrink-0">
      {/* Stars row + quote icon */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < t.rating ? 'fill-primary text-primary' : 'fill-white text-primary'}`}
            />
          ))}
        </div>
        <Quote className="w-8 h-8 text-primary" />
      </div>

      {/* Review */}
      <p className="text-gray-900 text-sm leading-relaxed line-clamp-4 flex-1 text-justify">
        &ldquo;{t.review}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white text-sm shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="font-display font-bold text-gray-900 text-sm truncate">{t.name}</div>
          <div className="text-xs text-gray-900 truncate">
            {t.role ? `${t.role}, ` : ''}{t.company}
          </div>
        </div>
        {firstWord && (
          <span className="ml-auto section-badge text-[10px] shrink-0">{firstWord}</span>
        )}
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/testimonials')
      .then((r) => r.json())
      .then((data) => { if (active) setTestimonials(Array.isArray(data?.reviews) ? data.reviews : []); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  
  if (loading) {
  return (
    <section className="py-12 bg-white">
      <div className="container-custom flex items-center justify-center min-h-[200px]">
        <Spinner size="lg" />
      </div>
    </section>
  );
}
  
  if (testimonials.length === 0) return null;

  // Duplicate for seamless loop
  const doubled = [...testimonials, ...testimonials];

  return (
    <section className="py-12 bg-white overflow-hidden">
      <div className="container-custom">

        {/* Header — same pattern */}
        <div className="mb-4">
          <span className="section-badge">TESTIMONIALS</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <h2 className="section-title">
            What Our <span className="gradient-text">Clients Say</span>
          </h2>
          <p className="text-gray-900 text-base max-w-sm">
            Real results from real businesses who trusted us with their digital growth.
          </p>
        </div>
      </div>

      {/* Marquee — full width outside container */}
      <div className="relative">
        {/* Left fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10"
          style={{ background: 'linear-gradient(to right, white, transparent)' }} />
        {/* Right fade */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10"
          style={{ background: 'linear-gradient(to left, white, transparent)' }} />

        <div className="flex gap-6 w-max animate-marquee">
          {doubled.map((t, i) => (
            <TestimonialCard key={`${t._id || t.name}-${i}`} t={t} />
          ))}
        </div>
      </div>

    </section>
  );
}