import { LoaderCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

function buttonVariants({ variant = 'primary', size = 'md' } = {}) {
  const base = 'inline-flex shrink-0 items-center justify-center gap-2 rounded-button text-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px';
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover hover:shadow-card',
    accent: 'bg-accent text-white hover:bg-accent-hover hover:shadow-card',
    secondary: 'border border-primary bg-surface text-primary hover:bg-muted-soft',
    ghost: 'text-primary hover:bg-muted-soft',
    destructive: 'bg-danger text-white hover:bg-danger-hover hover:shadow-card',
    link: 'h-auto text-accent underline-offset-4 hover:text-accent-hover hover:underline',
  };
  const sizes = {
    sm: 'h-8 px-3',
    md: 'h-10 px-5',
    lg: 'h-12 px-6 text-base',
    icon: 'size-10 p-0',
    'icon-sm': 'size-8 p-0',
  };
  return cn(base, variants[variant] ?? variants.primary, sizes[size] ?? sizes.md);
}

export function Button({ className, variant, size, loading, children, disabled, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoaderCircle aria-hidden className="size-4 animate-spin-slow" />}
      <span className={cn('inline-flex items-center gap-2', loading && 'invisible')}>
        {children}
      </span>
    </button>
  );
}

export function LinkButton({ href, children, variant = 'link', className, ...props }) {
  return (
    <a href={href} className={cn(buttonVariants({ variant }), className)} {...props}>
      {children}
    </a>
  );
}

