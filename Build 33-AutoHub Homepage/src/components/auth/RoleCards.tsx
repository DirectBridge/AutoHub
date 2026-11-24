import { useRef } from "react";
import { ArrowLeftRight, Car, CheckCircle2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectableRole = "buyer" | "seller" | "both";

export const roleOptions: {
  value: SelectableRole;
  title: string;
  description: string;
  icon: typeof Search;
}[] = [
  {
    value: "buyer",
    title: "I want to buy or rent a car",
    description: "Browse, save cars and message sellers.",
    icon: Search,
  },
  {
    value: "seller",
    title: "I want to sell or rent out my car",
    description: "Post listings and reply to buyers.",
    icon: Car,
  },
  {
    value: "both",
    title: "Both",
    description: "Buy, rent and sell from one account.",
    icon: ArrowLeftRight,
  },
];

/** Radio-group of role cards. Arrow keys move focus; Space/Enter selects. */
export function RoleCards({
  value,
  onChange,
  label,
  autoFocusRef,
}: {
  value?: SelectableRole;
  onChange: (role: SelectableRole) => void;
  label: string;
  autoFocusRef?: React.MutableRefObject<(HTMLButtonElement | null)[]>;
}) {
  const localRef = useRef<(HTMLButtonElement | null)[]>([]);
  const radios = autoFocusRef ?? localRef;
  const selectedIndex = roleOptions.findIndex((item) => item.value === value);

  const onKey = (event: React.KeyboardEvent, index: number) => {
    const keys: Record<string, number> = {
      ArrowDown: 1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowLeft: -1,
    };
    if (event.key in keys) {
      event.preventDefault();
      radios.current[(index + keys[event.key] + roleOptions.length) % roleOptions.length]?.focus();
    }
  };

  return (
    <div role="radiogroup" aria-label={label} className="grid gap-3">
      {roleOptions.map(({ value: option, title, description, icon: Icon }, index) => {
        const selected = value === option;
        return (
          <button
            key={option}
            ref={(node) => {
              radios.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (selectedIndex === -1 && index === 0) ? 0 : -1}
            onClick={() => onChange(option)}
            onKeyDown={(event) => onKey(event, index)}
            className={cn(
              "flex w-full items-center gap-4 rounded-card border bg-surface p-4 text-left hover:border-secondary",
              selected && "border-accent bg-accent-soft hover:border-accent",
            )}
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-button bg-navy-soft text-primary",
                selected && "bg-surface",
              )}
            >
              <Icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-text-primary">{title}</span>
              <span className="mt-0.5 block text-xs text-text-secondary">{description}</span>
            </span>
            <CheckCircle2
              aria-hidden
              className={cn("size-5 shrink-0", selected ? "text-accent-hover" : "text-transparent")}
            />
          </button>
        );
      })}
    </div>
  );
}
