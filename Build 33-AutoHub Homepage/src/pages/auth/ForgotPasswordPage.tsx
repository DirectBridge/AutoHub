import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, MailCheck } from "lucide-react";
import { AuthHeading, AuthLayout, AuthSwitch, TextLink } from "@/components/auth/AuthLayout";
import { TextField } from "@/components/auth/FormField";
import { useCooldown } from "@/components/auth/useCooldown";
import { emailField } from "@/components/auth/validation";
import { Button, LinkButton } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({ email: emailField });

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const cooldown = useCooldown();
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { email: "" },
  });

  useEffect(() => setFocus("email"), [setFocus]);

  const send = async (email: string) => {
    // Always succeed so the page never reveals which emails are registered.
    try {
      await requestPasswordReset(email);
    } catch {
      /* intentionally ignored */
    }
    setSentTo(email);
    cooldown.start(60);
  };

  return (
    <AuthLayout title="Forgot password" panelHeading="Account recovery">
      {sentTo ? (
        <div className="text-center" role="status">
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-accent-soft text-accent-hover">
            <MailCheck className="size-9" strokeWidth={1.75} />
          </span>
          <h1 className="mt-6 text-[2rem] font-bold leading-10 text-text-primary">
            Check your email
          </h1>
          <p className="mt-3 text-base leading-6 text-text-secondary">
            If an account exists for this email, you'll receive a reset link shortly.
          </p>
          <p className="mt-5 text-sm text-text-secondary">
            {cooldown.active ? (
              <span className="price font-medium">Resend in {cooldown.label}</span>
            ) : (
              <button
                type="button"
                disabled={resending}
                onClick={async () => {
                  setResending(true);
                  await send(sentTo);
                  setResending(false);
                }}
                className="font-semibold text-accent hover:text-accent-hover hover:underline"
              >
                {resending ? "Sending…" : "Resend link"}
              </button>
            )}
          </p>
          <LinkButton href="/login" variant="secondary" className="mt-7 h-12 w-full">
            <ArrowLeft className="size-4" />
            Back to log in
          </LinkButton>
        </div>
      ) : (
        <>
          <AuthHeading
            title="Forgot your password?"
            subtitle="Enter your email and we'll send you a reset link."
          />
          <form
            noValidate
            onSubmit={handleSubmit((values) => send(values.email))}
            className="grid gap-5"
          >
            <TextField
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
              {isSubmitting ? "Sending link…" : "Send reset link"}
            </Button>
          </form>
          <AuthSwitch>
            Remembered it? <TextLink href="/login">Back to log in</TextLink>
          </AuthSwitch>
        </>
      )}
    </AuthLayout>
  );
}
