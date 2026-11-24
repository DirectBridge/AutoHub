import { Camera, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Tooltip } from '../Tooltip/Tooltip';

const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium';

export function ListingTypeBadge({ type }) {
  return (
    <span className={cn(base, type === 'sale' ? 'bg-accent-soft text-accent-hover' : 'bg-rent-soft text-rent')}>
      {type === 'sale' ? 'For Sale' : 'For Rent'}
    </span>
  );
}

export function StatusBadge({ status }) {
  return <span className={cn(base, 'bg-muted-soft text-muted capitalize')}>{status}</span>;
}

export function VerifiedBadge({ compact = false }) {
  if (compact)
    return (
      <Tooltip label="Verified seller">
        <span tabIndex={0} aria-label="Verified seller" className="inline-flex size-5 items-center justify-center rounded-full bg-success-soft text-success">
          <ShieldCheck aria-hidden className="size-3.5" strokeWidth={2} />
        </span>
      </Tooltip>
    );
  return (
    <span className={cn(base, 'bg-success-soft text-success')}>
      <ShieldCheck aria-hidden className="size-4" />
      Verified seller
    </span>
  );
}

export function UnverifiedBadge({ compact = false }) {
  return (
    <span
      className={cn(compact ? 'inline-flex size-5 items-center justify-center rounded-full' : base, 'bg-warning-soft text-warning')}
      aria-label="Unverified seller"
    >
      <ShieldAlert aria-hidden className={compact ? 'size-3.5' : 'size-4'} />
      {!compact && 'Unverified'}
    </span>
  );
}

export function NewBadge() {
  return (
    <span className={cn(base, 'bg-navy-soft text-primary')}>
      <Sparkles aria-hidden className="size-3.5" />
      New
    </span>
  );
}

export function PhotoCount({ count }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/80 px-2 py-1 text-xs font-medium text-white">
      <Camera aria-hidden className="size-3.5" />
      {count}
    </span>
  );
}

