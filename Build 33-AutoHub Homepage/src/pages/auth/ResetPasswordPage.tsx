import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { AuthHeading, AuthLayout, AuthSwitch, TextLink } from "@/components/auth/AuthLayout";
import { FormAlert, PasswordField } from "@/components/auth/FormField";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { newPasswordField } from "@/components/auth/validation";
import { Button, LinkButton } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
  password: newPasswordField,
  confirmPassword: z.string().min(1, "Confirm your new password"),
});
type Values = z.infer<typeof schema>;

const resolver: Resolver<Values> = async (values, context, options) => {
  const result = await zodResolver(schema)(values, context, options);
  if (values.confirmPassword && values.password !== values.confirmPassword) {
    return {
      values: {},
      errors: {
        ...result.errors,
        confirmPassword: { type: "validate", message: "Passwords don't match" },
      },
    } as Awaited<ReturnType<Resolver<Values>>>;
  }
  return result as Awaited<ReturnType<Resolver<Values>>>;
};

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [state, setState] = useState<"form" | "success" | "expired">(() =>
    new URLSearchParams(window.location.search).get("expired") === "1" ? "expired" : "form",
  );
  const [formError, setFormError] = useState("");
  const [countdown, setCountdown] = useState(5);
  const {
    register,
    handleSubmit,
    setFocus,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver,
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (state === "form") setFocus("password");
  }, [state, setFocus]);

  useEffect(() => {
    if (state !== "success") return;
    if (countdown === 0) {
      window.location.assign("/login");
      return;
    }
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [state, countdown]);

  return (
    <AuthLayout title="Reset password" panelHeading="Account recovery">
      {state === "expired" ? (
        <div className="text-center">
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-warning-soft text-warning">
            <AlertTriangle className="size-9" strokeWidth={1.75} />
          </span>
          <h1 className="mt-6 text-[2rem] font-bold leading-10 text-text-primary">
            This reset link has expired
          </h1>
          <p className="mt-3 text-base leading-6 text-text-secondary">
            For your security, reset links only work for a limited time.
          </p>
          <LinkButton href="/forgot-password" variant="primary" className="mt-7 h-12 w-full">
            Request a new link
          </LinkButton>
        </div>
      ) : state === "success" ? (
        <div className="text-center" role="status">
          <CheckCircle2 className="mx-auto size-16 text-success" strokeWidth={1.75} />
          <h1 className="mt-6 text-[2rem] font-bold leading-10 text-text-primary">
            Your password has been updated
          </h1>
          <p className="mt-3 text-base leading-6 text-text-secondary">
            You can now log in with your new password.
          </p>
          <LinkButton href="/login" variant="primary" className="mt-7 h-12 w-full">
            Log in
          </LinkButton>
          <p className="price mt-3 text-sm text-text-secondary" aria-live="polite">
            Redirecting in {countdown}s
          </p>
        </div>
      ) : (
        <>
          <AuthHeading
            title="Set a new password"
            subtitle="Choose a strong password you don't use elsewhere."
          />
          <FormAlert>{formError}</FormAlert>
          <form
            noValidate
            onSubmit={handleSubmit(async (values) => {
              setFormError("");
              try {
                await resetPassword(values.password);
                setState("success");
              } catch (error) {
                setFormError(error instanceof Error ? error.message : "Something went wrong.");
              }
            })}
            className="grid gap-5"
          >
            <div>
              <PasswordField
                label="New password"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register("password")}
              />
              <PasswordStrength value={watch("password")} />
            </div>
            <PasswordField
              label="Confirm password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
              {isSubmitting ? "Updating password…" : "Update password"}
            </Button>
          </form>
          <AuthSwitch>
            <TextLink href="/login">Back to log in</TextLink>
          </AuthSwitch>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setState("expired")}
              className="rounded-button border border-dashed px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary"
            >
              Dev: simulate expired link
            </button>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
