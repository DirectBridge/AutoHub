import { useState } from "react";
import { MailCheck } from "lucide-react";
import { AuthLayout, AuthSwitch, TextLink } from "@/components/auth/AuthLayout";
import { useCooldown } from "@/components/auth/useCooldown";
import { getRedirect } from "@/components/auth/validation";
import { Button, LinkButton } from "@/components/ui/button";
import { safeRedirect, useAuth } from "@/context/AuthContext";
import { useGlobalToast } from "@/components/ui/toast";

export function VerifyEmailPage() {
  const { resendConfirmation, confirmEmail } = useAuth();
  const { flash } = useGlobalToast();
  const email = new URLSearchParams(window.location.search).get("email") || "karim@example.com";
  const cooldown = useCooldown(60);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState("");

  return (
    <AuthLayout title="Check your inbox" panelHeading="One last step">
      <div className="text-center">
        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-accent-soft text-accent-hover">
          <MailCheck className="size-9" strokeWidth={1.75} />
        </span>
        <h1 className="mt-6 text-[2rem] font-bold leading-10 text-text-primary">
          Check your inbox
        </h1>
        <p className="mt-3 text-base leading-6 text-text-secondary">
          We sent a confirmation link to{" "}
          <span className="font-semibold text-text-primary">{email}</span>. Click it to activate
          your account.
        </p>
        <LinkButton href="https://mail.google.com" variant="secondary" className="mt-7 h-12 w-full">
          Open Gmail
        </LinkButton>
        <div className="mt-4 text-sm text-text-secondary">
          Didn't get it?{" "}
          {cooldown.active ? (
            <span className="price font-medium">Resend in {cooldown.label}</span>
          ) : (
            <button
              type="button"
              disabled={sending}
              onClick={async () => {
                setSending(true);
                await resendConfirmation(email);
                setSending(false);
                setStatus("We sent a new confirmation email.");
                cooldown.start(60);
              }}
              className="font-semibold text-accent hover:text-accent-hover hover:underline"
            >
              {sending ? "Sending…" : "Resend email"}
            </button>
          )}
        </div>
        <p aria-live="polite" className="mt-2 text-xs text-success">
          {status}
        </p>
        <AuthSwitch>
          Wrong email? <TextLink href="/register">Sign up again</TextLink>
        </AuthSwitch>

        <div className="mt-8 rounded-card border border-dashed bg-muted-soft p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Dev only
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            loading={confirming}
            onClick={async () => {
              setConfirming(true);
              const user = await confirmEmail(email);
              flash(`Welcome to 33-AutoHub, ${user.firstName}!`);
              window.location.assign(safeRedirect(getRedirect()));
            }}
          >
            Simulate email confirmed
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
