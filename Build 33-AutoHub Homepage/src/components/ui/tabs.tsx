import { cn } from "@/lib/utils";

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="tablist" className={cn("inline-flex rounded-button bg-muted-soft p-1", className)}>
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          aria-selected={value === item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-semibold text-text-secondary",
            value === item.value && "bg-surface text-primary shadow-card",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
