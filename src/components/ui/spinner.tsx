import { cn } from '@/lib/utils';

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dark' | 'white';
  className?: string;
};

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-2',
};

const variantMap = {
  default: 'border-primary/20 border-t-primary',
  dark: 'border-dark/30 border-t-dark',
  white: 'border-white/30 border-t-white',
};

export function Spinner({ size = 'md', variant = 'default', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'rounded-full animate-spin',
        sizeMap[size],
        variantMap[variant],
        className
      )}
    />
  );
}