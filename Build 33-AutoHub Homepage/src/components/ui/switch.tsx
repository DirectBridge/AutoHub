import { useId } from "react";
import { Lock } from "lucide-react";
import { Tooltip } from "./tooltip";
import { cn } from "@/lib/utils";

/** Accessible toggle row: the title is the switch's name and the description is linked via aria-describedby. */
export function SwitchRow({
  title,
  description,
  checked,
  onChange,
  disabled,
  lockedReason,
}: {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  lockedReason?: string;
}) {
  const id = useId();
  const control = (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-labelledby={`${id}-label`}
      aria-describedby={description ? `${id}-description` : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-accent" : "bg-secondary",
      )}
    >
      <span
        className={cn(
          "absolute top-1 size-4 rounded-full bg-white transition",
          checked ? "left-6" : "left-1",
        )}
      />
    </button>
  );
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <div>
        <p
          id={`${id}-label`}
          className="flex items-center gap-1.5 text-sm font-semibold text-text-primary"
        >
          {title}
          {lockedReason && <Lock aria-hidden className="size-3.5 text-secondary" />}
        </p>
        {description && (
          <p id={`${id}-description`} className="mt-0.5 text-sm text-text-secondary">
            {description}
            {lockedReason && <span className="sr-only"> ({lockedReason})</span>}
          </p>
        )}
      </div>
      {lockedReason ? (
        <Tooltip label={lockedReason}>
          <span tabIndex={0} className="rounded-full">
            {control}
          </span>
        </Tooltip>
      ) : (
        control
      )}
    </div>
  );
}
