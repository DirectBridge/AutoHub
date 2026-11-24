import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const verificationSteps = ["ID document", "Proof of address", "Review", "Done"];

export function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Verification steps">
      {verificationSteps.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className={cn(
              "flex min-w-0 items-center gap-2",
              index < verificationSteps.length - 1 && "flex-1",
            )}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                done && "border-primary bg-primary text-white",
                active && "border-primary bg-surface text-primary ring-2 ring-primary/15",
                !done && !active && "border-border bg-surface text-text-secondary",
              )}
            >
              {done ? <Check aria-hidden className="size-3.5" strokeWidth={3} /> : index + 1}
            </span>
            <span
              className={cn(
                "hidden truncate text-sm sm:block",
                active
                  ? "font-semibold text-primary"
                  : done
                    ? "font-medium text-text-primary"
                    : "text-text-secondary",
              )}
            >
              {label}
              <span className="sr-only">
                {done ? " (completed)" : active ? " (current step)" : ""}
              </span>
            </span>
            {index < verificationSteps.length - 1 && (
              <span aria-hidden className={cn("h-px flex-1", done ? "bg-primary" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
