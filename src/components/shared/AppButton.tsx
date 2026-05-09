import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AppButtonProps = {
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  className?: string;
  external?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

const baseClass = 'inline-flex items-center gap-2 text-base px-7 py-3 font-semibold rounded-lg transition-all duration-200';

const variants = {
  primary: 'bg-primary text-white border-primary hover:bg-primary-600',
  secondary: 'bg-white border border-gray-900 text-gray-900 hover:border-primary hover:text-primary',
};

const shadows = {
  primary: '0 4px 20px rgba(0,212,255,0.3)',
  secondary: '0 2px 8px rgba(0,0,0,0.06)',
};

export default function AppButton({
  href,
  onClick,
  variant = 'primary',
  children,
  className,
  external,
  type = 'button',
  disabled,
}: AppButtonProps) {
  const classes = cn(baseClass, variants[variant], className);
  const style = { boxShadow: shadows[variant] };

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        style={style}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(classes, disabled && 'opacity-50 cursor-not-allowed')}
      style={style}
    >
      {children}
    </button>
  );
}