import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  hideLabel?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, hideLabel, id, ...props }, ref) => {
    const inputId = id || React.useId();
    return (
      <label className="grid gap-1.5 text-sm font-medium text-primary" htmlFor={inputId}>
        <span className={hideLabel ? "sr-only" : ""}>{label}</span>
        <span className="relative block">
          {icon && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-secondary">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-11 w-full rounded-button border bg-surface px-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-muted-soft disabled:text-text-secondary",
              icon && "pl-10",
              error && "border-danger focus:border-danger focus:ring-danger/20",
              className,
            )}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </span>
        {error && (
          <span id={`${inputId}-error`} className="text-xs font-medium text-danger">
            {error}
          </span>
        )}
      </label>
    );
  },
);
Input.displayName = "Input";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hideLabel?: boolean;
}

export function Select({ label, hideLabel, className, id, children, ...props }: SelectProps) {
  const selectId = id || React.useId();
  return (
    <label className="grid gap-1.5 text-sm font-medium text-primary" htmlFor={selectId}>
      <span className={hideLabel ? "sr-only" : ""}>{label}</span>
      <span className="relative block">
        <select
          id={selectId}
          className={cn(
            "h-11 w-full appearance-none rounded-button border bg-surface px-3 pr-10 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-muted-soft disabled:text-text-secondary",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-3.5 size-4 text-secondary"
        />
      </span>
    </label>
  );
}
