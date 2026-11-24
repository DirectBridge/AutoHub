import { forwardRef, useId, useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helper?: React.ReactNode;
  optional?: boolean;
  labelAction?: React.ReactNode;
  prefix?: string;
  suffix?: React.ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    { label, error, helper, optional, labelAction, prefix, suffix, className, id, ...props },
    ref,
  ) => {
    const generated = useId();
    const inputId = id ?? generated;
    const describedBy = error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined;
    return (
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor={inputId} className="text-sm font-semibold text-text-primary">
            {label}
            {optional && <span className="font-normal text-text-secondary"> (optional)</span>}
          </label>
          {labelAction}
        </div>
        <div className="relative">
          {prefix && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center border-r px-3 text-sm font-medium text-text-secondary">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "h-11 w-full rounded-button border bg-surface px-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-muted-soft",
              prefix && "pl-[4.25rem]",
              suffix && "pr-11",
              error && "border-danger focus:border-danger focus:ring-danger/20",
              className,
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-1">{suffix}</div>
          )}
        </div>
        {error ? (
          <p
            id={`${inputId}-error`}
            className="flex items-center gap-1 text-xs font-medium text-danger"
          >
            <AlertCircle aria-hidden className="size-3.5 shrink-0" />
            {error}
          </p>
        ) : (
          helper && (
            <div id={`${inputId}-helper`} className="text-xs text-text-secondary">
              {helper}
            </div>
          )
        )}
      </div>
    );
  },
);
TextField.displayName = "TextField";

export const PasswordField = forwardRef<HTMLInputElement, Omit<TextFieldProps, "type" | "suffix">>(
  (props, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <TextField
        ref={ref}
        {...props}
        type={visible ? "text" : "password"}
        suffix={
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="flex size-9 items-center justify-center rounded-md text-secondary hover:bg-muted-soft hover:text-primary"
          >
            {visible ? <EyeOff className="size-[1.125rem]" /> : <Eye className="size-[1.125rem]" />}
          </button>
        }
      />
    );
  },
);
PasswordField.displayName = "PasswordField";

export function FormAlert({ children }: { children?: React.ReactNode }) {
  return (
    <div aria-live="assertive" aria-atomic="true">
      {children && (
        <div
          role="alert"
          className="mb-5 flex gap-2.5 rounded-button border border-danger/20 bg-danger/5 p-3.5 text-sm text-danger"
        >
          <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
          <div>{children}</div>
        </div>
      )}
    </div>
  );
}

export function Checkbox({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode; error?: string }) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-2.5 text-sm text-text-primary"
      >
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-4 shrink-0 rounded border-border accent-accent"
          {...props}
        />
        <span>{label}</span>
      </label>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 flex items-center gap-1 text-xs font-medium text-danger"
        >
          <AlertCircle aria-hidden className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
