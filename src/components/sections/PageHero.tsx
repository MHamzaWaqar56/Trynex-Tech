import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageHeroProps = {
  badge?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  backHref?: string;
  backLabel?: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string; external?: boolean };
  className?: string;
  children?: ReactNode;
  bgImage?: string;
};

export default function PageHero({
  badge,
  title,
  description,
  align = 'center',
  primaryAction,
  secondaryAction,
  className,
  children,
  bgImage,
}: PageHeroProps) {
  const isCentered = align === 'center';

  return (
    <section className={cn('relative overflow-hidden pt-40 pb-24 h-[450px] flex items-center', className)}>

      {/* Background */}
      {bgImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${bgImage}')` }}
          />
          <div className="absolute inset-0" style={{ background: '#0c1324a1' }} />
        </>
      ) : (
        <div className="absolute inset-0 bg-grid-pattern opacity-100" />
      )}

      {/* Cyan glow blob */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #00D4FF 0%, transparent 70%)' }}
      />

      <div className="container-custom relative z-10">
        <div className={cn('mx-auto', isCentered ? 'max-w-[52rem] text-center' : 'max-w-[64rem]')}>

         

          {/* Badge */}
          {badge && (
            <div className={cn('mb-5 animate-fade-up', isCentered ? 'flex justify-center' : '')}>
              <span className="section-badge">{badge}</span>
            </div>
          )}

          {/* Title */}
          <h1
            className={cn(
              'font-display font-bold text-white leading-[1.1] tracking-tight mb-5 animate-fade-up animation-delay-100',
              !isCentered && 'text-left'
            )}
            style={{ fontSize: 'clamp(2.4rem, 6vw, 3.30rem)' }}
          >
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p
              className={cn(
                'text-white text-lg leading-relaxed animate-fade-up animation-delay-200 min-[320px]:max-[600px]:text-[16px] min-[320px]:max-[600px]:leading-[22px]',
                isCentered ? 'mx-auto max-w-2xl' : 'max-w-3xl'
              )}
            >
              {description}
            </p>
          )}

          {/* Actions */}
          {(primaryAction || secondaryAction || children) && (
            <div
              className={cn(
                'mt-10 flex flex-col sm:flex-row gap-4 animate-fade-up animation-delay-300',
                isCentered ? 'items-center justify-center' : 'items-start'
              )}
            >
              {primaryAction && (
                <Link href={primaryAction.href} className="btn-primary text-base px-8 py-3.5 gap-2">
                  {primaryAction.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {secondaryAction && (
                <Link
                  href={secondaryAction.href}
                  target={secondaryAction.external ? '_blank' : undefined}
                  rel={secondaryAction.external ? 'noopener noreferrer' : undefined}
                  className="btn-secondary text-base px-8 py-3.5 gap-2"
                >
                  {secondaryAction.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {children}
            </div>
          )}
        </div>
      </div>

      {/* Bottom fade — same as HeroSection */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #0C1324, transparent)' }}
      />
    </section>
  );
}