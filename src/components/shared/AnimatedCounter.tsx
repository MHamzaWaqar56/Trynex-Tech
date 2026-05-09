
'use client';

import { useEffect, useRef, useState } from 'react';

interface CounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  label: string;
  description?: string;
}

export default function AnimatedCounter({
  end,
  suffix = '',
  prefix = '',
  duration = 2000,
  label,
  description,
}: CounterProps) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Scroll mein aaye tab counter start ho
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const frameDuration = 16;
    const steps = Math.max(1, Math.round(duration / frameDuration));
    const step = end / steps;

    const timer = window.setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        window.clearInterval(timer);
        return;
      }
      setCount(Math.floor(start));
    }, frameDuration);

    return () => window.clearInterval(timer);
  }, [started, end, duration]);

  return (
    <div ref={ref} className="flex flex-col items-center">
      {/* Number */}
      <div className="text-4xl lg:text-[2.5rem] font-display font-bold text-primary mb-1">
        {prefix}{count}{suffix}
      </div>
      {/* Label */}
      <div className="font-semibold text-gray-900 text-sm mb-1">{label}</div>
      {/* Description */}
      {description && (
        <div className="text-sm text-gray-900">{description}</div>
      )}
    </div>
  );
}