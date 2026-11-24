import { useState } from "react";
import { Check, Clock, ShieldAlert, ShieldCheck, X, XCircle } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type VerificationState = "none" | "pending" | "approved" | "rejected";

export function VerificationStatusCard({
  state,
  userId,
}: {
  state: VerificationState;
  userId: string;
}) {
  const dismissKey = `autohub:verificationDismissed:${userId}`;
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(dismissKey) === "1";
    } catch {
      return false;
    }
  });

  if (state === "approved" && dismissed) return null;

  if (state === "none")
    return (
      <Shell className="bg-warning-soft" icon={<ShieldAlert className="size-6 text-warning" />}>
        <div className="flex-1">
          <h2 className="font-semibold text-text-primary">Your identity isn't verified yet</h2>
          <p className="mt-1 text-sm text-muted">
            Verified sellers get a trust badge and up to 3× more inquiries.
          </p>
        </div>
        <LinkButton href="/verification" variant="accent" className="shrink-0">
          Get verified
        </LinkButton>
      </Shell>
    );

  if (state === "pending")
    return (
      <Shell className="bg-rent-soft" icon={<Clock className="size-6 text-rent" />}>
        <div className="flex-1">
          <h2 className="font-semibold text-text-primary">Verification in review</h2>
          <p className="mt-1 text-sm text-muted">
            We usually review documents within 48 hours. Submitted Nov 20, 2026.
          </p>
          <ReviewProgress className="mt-4" />
        </div>
      </Shell>
    );

  if (state === "approved")
    return (
      <Shell className="bg-success-soft" icon={<ShieldCheck className="size-6 text-success" />}>
        <div className="flex-1">
          <h2 className="font-semibold text-text-primary">You're a verified seller</h2>
          <p className="mt-1 text-sm text-muted">Your badge is visible on all your listings.</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Dismiss"
          className="shrink-0 self-start hover:bg-surface/60"
          onClick={() => {
            setDismissed(true);
            try {
              localStorage.setItem(dismissKey, "1");
            } catch {
              /* ignore */
            }
          }}
        >
          <X className="size-4" />
        </Button>
      </Shell>
    );

  return (
    <Shell className="bg-danger/10" icon={<XCircle className="size-6 text-danger" />}>
      <div className="flex-1">
        <h2 className="font-semibold text-text-primary">Verification was not approved</h2>
        <p className="mt-1 text-sm text-muted">Reason: The ID photo was blurry.</p>
      </div>
      <LinkButton href="/verification" variant="primary" className="shrink-0">
        Submit again
      </LinkButton>
    </Shell>
  );
}

function Shell({
  className,
  icon,
  children,
}: {
  className: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label="Verification status"
      className={cn("flex flex-col gap-4 rounded-card p-5 sm:flex-row sm:items-center", className)}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface">
        {icon}
      </span>
      {children}
    </section>
  );
}

export function ReviewProgress({ className }: { className?: string }) {
  return (
    <ol
      className={cn("flex max-w-md items-center gap-2 text-xs font-medium", className)}
      aria-label="Verification progress"
    >
      <Step label="Submitted" state="done" />
      <span aria-hidden className="h-px flex-1 bg-rent/40" />
      <Step label="In review" state="current" />
      <span aria-hidden className="h-px flex-1 bg-border" />
      <Step label="Decision" state="todo" />
    </ol>
  );
}

function Step({ label, state }: { label: string; state: "done" | "current" | "todo" }) {
  return (
    <li
      className={cn(
        "flex items-center gap-1.5",
        state === "todo" ? "text-text-secondary" : "text-rent",
      )}
    >
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-full border",
          state === "done" && "border-rent bg-rent text-white",
          state === "current" && "border-rent bg-surface",
          state === "todo" && "border-border bg-surface",
        )}
      >
        {state === "done" && <Check className="size-3" strokeWidth={3} />}
        {state === "current" && <span className="size-2 rounded-full bg-rent" />}
      </span>
      {label}
      <span className="sr-only">
        {state === "done" ? "(complete)" : state === "current" ? "(current step)" : "(upcoming)"}
      </span>
    </li>
  );
}
