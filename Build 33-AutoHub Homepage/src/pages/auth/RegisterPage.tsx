import { useEffect, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldCheck } from "lucide-react";
import { RoleCards, roleOptions as roles } from "@/components/auth/RoleCards";
import { AuthHeading, AuthLayout, AuthSwitch, TextLink } from "@/components/auth/AuthLayout";
import { Checkbox, FormAlert, PasswordField, TextField } from "@/components/auth/FormField";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import {
  emailField,
  formatPhone,
  getRedirect,
  newPasswordField,
} from "@/components/auth/validation";
import { Button } from "@/components/ui/button";
import { AuthError, roleLabel, safeRedirect, useAuth } from "@/context/AuthContext";
import { useGlobalToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Role = "buyer" | "seller" | "both";

function makeSchema(role?: Role) {
  const phone = z.string().refine(
    (value) => {
      const digits = value.replace(/\D/g, "");
      return (!digits && role === "buyer") || /^[567]\d{8}$/.test(digits);
    },
    role === "buyer"
      ? "Enter a valid Algerian mobile number, e.g. 555 12 34 56"
      : "Enter your mobile number, e.g. 555 12 34 56",
  );
  return z.object({
    role: z.enum(["buyer", "seller", "both"], { message: "Choose how you'll use 33-AutoHub" }),
    firstName: z.string().trim().min(1, "Enter your first name"),
    lastName: z.string().trim().min(1, "Enter your last name"),
    email: emailField,
    phone,
    password: newPasswordField,
    confirmPassword: z.string().min(1, "Confirm your password"),
    terms: z
      .boolean()
      .refine(Boolean, "Accept the Terms of Service and Privacy Policy to continue"),
  });
}

type Values = z.infer<ReturnType<typeof makeSchema>>;

// The schema depends on the selected role (phone is required for sellers),
// and the password confirmation is cross-field, so both are handled here.
const resolver: Resolver<Values> = async (values, context, options) => {
  const result = await zodResolver(makeSchema(values.role))(values, context, options);
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

export function RegisterPage() {
  const { register: createAccount, loginWithGoogle } = useAuth();
  const { flash } = useGlobalToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [formError, setFormError] = useState<AuthError | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const redirect = getRedirect();
  const radios = useRef<(HTMLButtonElement | null)[]>([]);
  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver,
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      role: undefined,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });
  const role = watch("role");
  const password = watch("password");
  const query = redirect ? `?redirect=${encodeURIComponent(redirect)}` : "";

  useEffect(() => {
    if (step === 2) setFocus("firstName");
    else
      radios.current[
        Math.max(
          0,
          roles.findIndex((item) => item.value === role),
        )
      ]?.focus();
  }, [step]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const { email } = await createAccount({
        role: values.role,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
      });
      const params = new URLSearchParams({ email, name: values.firstName.trim() });
      if (redirect) params.set("redirect", redirect);
      window.location.assign(`/verify-email?${params}`);
    } catch (error) {
      setFormError(
        error instanceof AuthError
          ? error
          : new AuthError("unknown", "Something went wrong. Please try again."),
      );
    }
  });

  const phoneField = register("phone");
  const stepTitle = step === 1 ? "How will you use 33-AutoHub?" : "Create your account";

  return (
    <AuthLayout title="Create account" panelHeading="Join Algeria's trusted car marketplace">
      <div className="mb-6">
        <p
          className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
          aria-hidden
        >
          Step {step} of 2
        </p>
        <p className="sr-only" aria-live="polite">
          Step {step} of 2: {stepTitle}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-1.5" aria-hidden>
          {[1, 2].map((item) => (
            <span
              key={item}
              className={cn("h-1 rounded-full", item <= step ? "bg-primary" : "bg-border")}
            />
          ))}
        </div>
      </div>

      <AuthHeading
        title={stepTitle}
        subtitle={step === 1 ? "Choose the option that fits you best." : undefined}
      />

      {step === 1 ? (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (role) setStep(2);
          }}
        >
          <RoleCards
            label={stepTitle}
            value={role}
            autoFocusRef={radios}
            onChange={(value) => setValue("role", value, { shouldValidate: true })}
          />
          <p className="mt-4 text-sm text-text-secondary">
            Buyers can always browse and message. You can change this later in settings.
          </p>
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={!role}>
            Continue
          </Button>
        </form>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between gap-3 rounded-button border bg-background px-3 py-2 text-sm">
            <span className="text-text-secondary">
              Signing up as{" "}
              <span className="font-semibold text-primary">{role ? roleLabel[role] : ""}</span>
            </span>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="font-semibold text-accent hover:text-accent-hover hover:underline"
            >
              Change
            </button>
          </div>

          <FormAlert>
            {formError && (
              <>
                {formError.message}
                {formError.code === "email_taken" && (
                  <>
                    {" "}
                    <a
                      href={`/login${query}`}
                      className="font-semibold underline underline-offset-4"
                    >
                      Log in instead
                    </a>
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
              flash(`Welcome to 33-AutoHub, ${user.firstName}!`);
              window.location.assign(safeRedirect(redirect));
            }}
          />

          <form noValidate onSubmit={onSubmit} className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-3">
              <TextField
                label="First name"
                autoComplete="given-name"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <TextField
                label="Last name"
                autoComplete="family-name"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>
            <TextField
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <TextField
              label="Phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              prefix="+213"
              placeholder="5XX XX XX XX"
              optional={role === "buyer"}
              error={errors.phone?.message}
              helper={
                role === "buyer"
                  ? "Add a number if you'd like sellers to call you."
                  : "Required for sellers. Shared only with buyers you choose."
              }
              {...phoneField}
              onChange={(event) => {
                event.target.value = formatPhone(event.target.value);
                return phoneField.onChange(event);
              }}
            />
            <div>
              <PasswordField
                label="Password"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register("password")}
              />
              <PasswordStrength value={password} />
            </div>
            <PasswordField
              label="Confirm password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <Checkbox
              label={
                <>
                  I agree to the <TextLink href="#">Terms of Service</TextLink> and{" "}
                  <TextLink href="#">Privacy Policy</TextLink>
                </>
              }
              error={errors.terms?.message}
              {...register("terms")}
            />
            {role !== "buyer" && (
              <div className="flex gap-3 rounded-card bg-accent-soft p-4 text-sm leading-6 text-primary">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent-hover" />
                After signing up, verify your identity to get the Verified badge and more inquiries.
              </div>
            )}
            <div className="grid gap-2">
              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="w-full"
                loading={isSubmitting}
                disabled={googleLoading}
              >
                {isSubmitting ? "Creating account…" : "Create account"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
            </div>
          </form>
        </>
      )}

      <AuthSwitch>
        Already have an account? <TextLink href={`/login${query}`}>Log in</TextLink>
      </AuthSwitch>
    </AuthLayout>
  );
}
