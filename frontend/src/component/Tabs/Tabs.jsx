import { cn } from '../../lib/utils';

export function Tabs({ items, value, onChange, className }) {
  return (
    <div role="tablist" className={cn('inline-flex rounded-button bg-muted-soft p-1', className)}>
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          aria-selected={value === item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-semibold text-text-secondary',
            value === item.value && 'bg-surface text-primary shadow-card',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

