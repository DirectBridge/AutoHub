import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthHeading, AuthLayout, AuthSwitch, TextLink } from "@/components/auth/AuthLayout";
import { Checkbox, FormAlert, PasswordField, TextField } from "@/components/auth/FormField";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { emailField, getRedirect } from "@/components/auth/validation";
import { Button } from "@/components/ui/button";
import { AuthError, safeRedirect, useAuth } from "@/context/AuthContext";
import { useGlobalToast } from "@/components/ui/toast";

const schema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean(),
});
type Values = z.infer<typeof schema>;

const demoAccounts = [
  { email: "buyer@autohub.dz", label: "Buyer" },
  { email: "seller@autohub.dz", label: "Verified seller" },
  { email: "newseller@autohub.dz", label: "Unverified seller" },
  { email: "unconfirmed@autohub.dz", label: "Email not confirmed" },
];

export function LoginPage() {
  const { login, loginWithGoogle, resendConfirmation } = useAuth();
  const { flash } = useGlobalToast();
  const [formError, setFormError] = useState<AuthError | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resent, setResent] = useState<"idle" | "sending" | "sent">("idle");
  const redirect = getRedirect();
  const {
    register,
    handleSubmit,
    setFocus,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { email: "", password: "", remember: true },
  });

  useEffect(() => setFocus("email"), [setFocus]);

  const finish = (firstName: string) => {
    flash(`Welcome back, ${firstName}!`);
    window.location.assign(safeRedirect(redirect));
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setResent("idle");
    try {
      const user = await login(values.email, values.password, values.remember);
      finish(user.firstName);
    } catch (error) {
      setFormError(
        error instanceof AuthError
          ? error
          : new AuthError("unknown", "Something went wrong. Please try again."),
      );
    }
  });

  const busy = isSubmitting || googleLoading;
  const query = redirect ? `?redirect=${encodeURIComponent(redirect)}` : "";

  return (
    <AuthLayout title="Log in" panelHeading="Welcome back to 33-AutoHub">
      <AuthHeading
        title="Welcome back"
        subtitle="Log in to message sellers, save cars and manage your listings."
      />
      <FormAlert>
        {formError && (
          <>
            {formError.message}
            {formError.code === "email_not_confirmed" && (
              <>
                {" "}
                {resent === "sent" ? (
                  <span className="font-semibold">Confirmation email sent.</span>
                ) : (
                  <button
                    type="button"
                    disabled={resent === "sending"}
                    onClick={async () => {
                      setResent("sending");
                      await resendConfirmation(getValues("email"));
                      setResent("sent");
                    }}
                    className="font-semibold underline underline-offset-4"
                  >
                    {resent === "sending" ? "Sending…" : "Resend email"}
                  </button>
                )}
              </>
            )}
          </>
        )}
      </FormAlert>

      <GoogleButton
        loading={googleLoading}
        disabled={isSubmitting}
        onClick={async () => {
          setGoogleLoading(true);
          const user = await loginWithGoogle();
          finish(user.firstName);
        }}
      />

      <form noValidate onSubmit={onSubmit} className="grid gap-5">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          labelAction={<TextLink href="/forgot-password">Forgot password?</TextLink>}
          {...register("password")}
        />
        <Checkbox label="Remember me" {...register("remember")} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting} disabled={busy}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <AuthSwitch>
        New to 33-AutoHub? <TextLink href={`/register${query}`}>Create an account</TextLink>
      </AuthSwitch>

      <div className="mt-8 rounded-card border border-dashed bg-muted-soft p-4 text-xs text-text-secondary">
        <p className="font-semibold uppercase tracking-wider">
          Demo accounts · password Password123
        </p>
        <ul className="mt-2 grid gap-1">
          {demoAccounts.map((account) => (
            <li key={account.email}>
              <button
                type="button"
                onClick={() => {
                  setValue("email", account.email);
                  setValue("password", "Password123");
                  setFocus("password");
                }}
                className="text-left hover:text-primary"
              >
                <span className="font-medium text-primary">{account.email}</span> · {account.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </AuthLayout>
  );
}
