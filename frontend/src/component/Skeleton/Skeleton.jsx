export function Skeleton({ className }) {
  return <div aria-hidden className={`animate-pulse rounded-md bg-muted-soft ${className ?? ''}`} />;
}

