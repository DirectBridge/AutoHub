import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MailCheck, ShieldCheck } from "lucide-react";
import { SettingsCard, useDirtyGuard } from "@/components/settings/SettingsShell";
import { FormAlert, PasswordField, TextField } from "@/components/auth/FormField";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { RoleCards, type SelectableRole } from "@/components/auth/RoleCards";
import { emailField, newPasswordField } from "@/components/auth/validation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { useGlobalToast } from "@/components/ui/toast";
import { AuthError, useAuth } from "@/context/AuthContext";
import { useListings } from "@/context/ListingsContext";

export function AccountSettings() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <>
      <EmailCard email={user.email} />
      <PasswordCard />
      <RoleCard />
      <ConnectedAccounts />
      <DangerZone />
    </>
  );
}

function EmailCard({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  return (
    <SettingsCard title="Email" description="Used to log in and receive notifications.">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-button border bg-background px-4 py-3">
        <span className="text-sm font-medium text-text-primary">{email}</span>
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          Change email
        </Button>
      </div>
      {open && <ChangeEmailDialog onClose={() => setOpen(false)} />}
    </SettingsCard>
  );
}

const emailSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your current password"),
});

function ChangeEmailDialog({ onClose }: { onClose: () => void }) {
  const { changeEmail } = useAuth();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  return (
    <Dialog label="Change email" onClose={onClose} className="max-w-[28rem]">
      {sentTo ? (
        <div className="p-6 text-center" role="status">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent-soft text-accent-hover">
            <MailCheck className="size-8" strokeWidth={1.75} />
          </span>
          <h2 className="mt-4 text-xl font-semibold">Check your new inbox to confirm the change</h2>
          <p className="mt-2 text-sm text-text-secondary">
            We sent a confirmation link to{" "}
            <span className="font-semibold text-text-primary">{sentTo}</span>. Your email stays the
            same until you confirm.
          </p>
          <Button className="mt-6" onClick={onClose}>
            Done
          </Button>
        </div>
      ) : (
        <form
          noValidate
          className="p-6"
          onSubmit={handleSubmit(async (values) => {
            setFormError("");
            try {
              await changeEmail(values.email, values.password);
              setSentTo(values.email.trim());
            } catch (error) {
              setFormError(error instanceof AuthError ? error.message : "Something went wrong.");
            }
          })}
        >
          <h2 className="pr-10 text-xl font-semibold leading-7">Change email</h2>
          <p className="mb-5 mt-1 text-sm text-text-secondary">
            We'll send a confirmation link to your new address.
          </p>
          <FormAlert>{formError}</FormAlert>
          <div className="grid gap-5">
            <TextField
              label="New email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <PasswordField
              label="Current password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Send confirmation
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

const passwordSchema = z.object({
  current: z.string().min(1, "Enter your current password"),
  password: newPasswordField,
  confirm: z.string().min(1, "Confirm your new password"),
});
type PasswordValues = z.infer<typeof passwordSchema>;
const passwordResolver: Resolver<PasswordValues> = async (values, context, options) => {
  const result = await zodResolver(passwordSchema)(values, context, options);
  if (values.confirm && values.password !== values.confirm)
    return {
      values: {},
      errors: { ...result.errors, confirm: { type: "validate", message: "Passwords don't match" } },
    } as Awaited<ReturnType<Resolver<PasswordValues>>>;
  return result as Awaited<ReturnType<Resolver<PasswordValues>>>;
};

function PasswordCard() {
  const { changePassword } = useAuth();
  const { show } = useGlobalToast();
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: passwordResolver,
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { current: "", password: "", confirm: "" },
  });
  useDirtyGuard("password", isDirty);

  return (
    <form
      id="password-form"
      noValidate
      onSubmit={handleSubmit(async (values) => {
        setFormError("");
        try {
          await changePassword(values.current, values.password);
          reset();
          show({ message: "Password updated" });
        } catch (error) {
          setFormError(error instanceof AuthError ? error.message : "Something went wrong.");
        }
      })}
    >
      <SettingsCard
        title="Change password"
        description="Use a strong password you don't use anywhere else."
        formId="password-form"
        dirty={isDirty}
        saving={isSubmitting}
        onCancel={() => {
          reset();
          setFormError("");
        }}
      >
        <FormAlert>{formError}</FormAlert>
        <div className="grid max-w-md gap-5">
          <PasswordField
            label="Current password"
            autoComplete="current-password"
            error={errors.current?.message}
            {...register("current")}
          />
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
            label="Confirm new password"
            autoComplete="new-password"
            error={errors.confirm?.message}
            {...register("confirm")}
          />
        </div>
      </SettingsCard>
    </form>
  );
}

function RoleCard() {
  const { user, updateProfile } = useAuth();
  const { listings } = useListings();
  const { show } = useGlobalToast();
  const saved = (user?.role === "admin" ? "both" : user?.role) as SelectableRole;
  const [role, setRole] = useState<SelectableRole>(saved);
  const [warning, setWarning] = useState(false);
  const [saving, setSaving] = useState(false);
  const dirty = role !== saved;
  useDirtyGuard("role", dirty);
  if (!user) return null;
  const activeCount = listings.filter(
    (item) => item.seller.id === user.id && item.status === "active",
  ).length;

  return (
    <form
      id="role-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        await updateProfile({ role });
        setSaving(false);
        show({ message: "Role updated" });
      }}
    >
      <SettingsCard
        title="How you use 33-AutoHub"
        description="Buyers can always browse and message. Sellers can also post listings."
        formId="role-form"
        dirty={dirty}
        saving={saving}
        onCancel={() => setRole(saved)}
      >
        <RoleCards
          label="Account role"
          value={role}
          onChange={(next) => {
            if (next === "buyer" && saved !== "buyer" && activeCount > 0) setWarning(true);
            else setRole(next);
          }}
        />
        {role !== "buyer" && !user.isVerified && (
          <div className="mt-4 flex gap-3 rounded-card bg-accent-soft p-4 text-sm text-primary">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent-hover" />
            <p>
              Next step: verify your identity to get the trust badge.{" "}
              <a
                href="/verification"
                className="font-semibold text-accent-hover underline underline-offset-4"
              >
                Go to verification
              </a>
            </p>
          </div>
        )}
      </SettingsCard>
      {warning && (
        <ConfirmDialog
          title="Switch to buyer?"
          description={`You have ${activeCount} active listings. They'll stay visible, but you won't be able to post new ones.`}
          confirmLabel="Switch to buyer"
          onClose={() => setWarning(false)}
          onConfirm={() => {
            setRole("buyer");
            setWarning(false);
          }}
        />
      )}
    </form>
  );
}

function GoogleMark() {
  // Google's brand colors are intentional here.
  return (
    <svg aria-hidden viewBox="0 0 48 48" className="size-5">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 2.9-2.2 5.4-4.7 7.1l7.6 5.9c4.4-4.1 6.9-10.1 6.9-17.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.9-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}

function ConnectedAccounts() {
  const { user, updateProfile } = useAuth();
  const { show } = useGlobalToast();
  const [busy, setBusy] = useState(false);
  return (
    <SettingsCard
      title="Connected accounts"
      description="Log in faster with an account you already use."
    >
      <div className="flex items-center justify-between gap-3 rounded-button border px-4 py-3">
        <span className="flex items-center gap-3 text-sm font-medium text-text-primary">
          <GoogleMark />
          Google
        </span>
        {user?.googleConnected ? (
          <span className="inline-flex items-center rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
            Connected
          </span>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            loading={busy}
            onClick={async () => {
              setBusy(true);
              await updateProfile({ googleConnected: true });
              setBusy(false);
              show({ message: "Google account connected" });
            }}
          >
            Connect
          </Button>
        )}
      </div>
    </SettingsCard>
  );
}

function DangerZone() {
  const { deleteAccount } = useAuth();
  const { flash } = useGlobalToast();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  return (
    <section
      aria-labelledby="danger-title"
      className="rounded-card border border-danger bg-surface p-5 shadow-card sm:p-6"
    >
      <h3 id="danger-title" className="text-xl font-semibold leading-7 text-danger">
        Delete account
      </h3>
      <p className="mt-1 text-sm text-text-secondary">
        This permanently deletes your profile, listings and messages.
      </p>
      <Button variant="destructive" className="mt-5" onClick={() => setOpen(true)}>
        Delete account
      </Button>
      {open && (
        <Dialog label="Delete account" onClose={() => setOpen(false)} className="max-w-[28rem]">
          <div className="p-6">
            <h2 className="pr-10 text-xl font-semibold leading-7">Delete your account?</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              This permanently deletes your profile, listings and messages. This can't be undone.
            </p>
            <div className="mt-5">
              <TextField
                label='Type "DELETE" to confirm'
                value={confirmText}
                autoComplete="off"
                onChange={(event) => setConfirmText(event.target.value)}
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={confirmText !== "DELETE"}
                loading={deleting}
                onClick={async () => {
                  setDeleting(true);
                  await deleteAccount();
                  flash("Your account has been deleted");
                  window.location.assign("/");
                }}
              >
                Delete account
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </section>
  );
}
