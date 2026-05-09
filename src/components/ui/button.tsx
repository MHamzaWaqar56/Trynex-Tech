import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50';

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-primary text-dark hover:bg-primary/90',
  secondary: 'bg-dark-card text-white border border-dark-border hover:bg-white/[0.04]',
  ghost: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  destructive: 'bg-red-500 text-white hover:bg-red-500/90',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3',
  lg: 'h-11 px-6',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button };
