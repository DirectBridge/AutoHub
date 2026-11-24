import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export const passwordRules = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "One number", test: (value: string) => /\d/.test(value) },
];

export function passwordScore(value: string) {
  if (!value) return 0;
  const met = passwordRules.filter((rule) => rule.test(value)).length;
  const bonus = value.length >= 12 || /[^A-Za-z0-9]/.test(value) ? 1 : 0;
  return Math.min(4, Math.max(1, met + (met === 3 ? bonus : 0)));
}

const levels = [
  { label: "Weak", bar: "bg-danger", text: "text-danger" },
  { label: "Fair", bar: "bg-warning", text: "text-warning" },
  { label: "Good", bar: "bg-accent", text: "text-accent" },
  { label: "Strong", bar: "bg-success", text: "text-success" },
];

export function PasswordStrength({ value }: { value: string }) {
  const score = passwordScore(value);
  const level = levels[Math.max(0, score - 1)];
  return (
    <div className="mt-2.5">
      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden>
          {levels.map((item, index) => (
            <span
              key={item.label}
              className={cn("h-1 rounded-full bg-border", index < score && level.bar)}
            />
          ))}
        </div>
        <span
          aria-live="polite"
          className={cn(
            "w-12 text-right text-xs font-semibold",
            score ? level.text : "text-text-secondary",
          )}
        >
          {score ? level.label : ""}
          {score > 0 && <span className="sr-only"> password strength</span>}
        </span>
      </div>
      <ul className="mt-2.5 grid gap-1">
        {passwordRules.map((rule) => {
          const met = rule.test(value);
          return (
            <li
              key={rule.label}
              className={cn(
                "flex items-center gap-1.5 text-xs",
                met ? "text-success" : "text-text-secondary",
              )}
            >
              {met ? (
                <Check className="size-3.5" strokeWidth={2.5} />
              ) : (
                <Circle className="size-3.5" />
              )}
              {rule.label}
              <span className="sr-only">{met ? "(met)" : "(not met)"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
