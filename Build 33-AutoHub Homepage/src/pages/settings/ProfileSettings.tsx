import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { SettingsCard, useDirtyGuard } from "@/components/settings/SettingsShell";
import { AvatarCropDialog } from "@/components/settings/AvatarCropDialog";
import { TextField } from "@/components/auth/FormField";
import { formatPhone } from "@/components/auth/validation";
import { isSellerRole } from "@/components/dashboard/DashboardLayout";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useGlobalToast } from "@/components/ui/toast";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import { defaultProfileFields } from "@/data/sellerProfiles";
import { wilayas } from "@/data/wilayas";
import { cn } from "@/lib/utils";

const MAX_ABOUT = 300;
const MAX_AVATAR = 2 * 1024 * 1024;

function makeSchema(phoneRequired: boolean) {
  return z.object({
    avatar: z.string(),
    firstName: z.string().trim().min(1, "Enter your first name"),
    lastName: z.string().trim().min(1, "Enter your last name"),
    phone: z.string().refine((value) => {
      const digits = value.replace(/\D/g, "");
      return (!digits && !phoneRequired) || /^[567]\d{8}$/.test(digits);
    }, "Enter a valid Algerian mobile number, e.g. 555 12 34 56"),
    wilaya: z
      .string()
      .refine((value) => !value || wilayas.includes(value), "Choose a wilaya from the list"),
    commune: z.string().trim().max(60, "Use 60 characters or fewer"),
    about: z.string().max(MAX_ABOUT, `Use ${MAX_ABOUT} characters or fewer`),
  });
}
type Values = z.infer<ReturnType<typeof makeSchema>>;

function initialValues(user: AuthUser): Values {
  const defaults = defaultProfileFields(user.id);
  return {
    avatar: user.avatar ?? "",
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ? formatPhone(user.phone) : "",
    wilaya: user.wilaya ?? defaults.wilaya,
    commune: user.commune ?? "",
    about: user.about ?? defaults.about,
  };
}

export function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  const { show } = useGlobalToast();
  const seller = isSellerRole(user?.role);
  const fileInput = useRef<HTMLInputElement>(null);
  const [avatarError, setAvatarError] = useState("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(makeSchema(seller)),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: user ? initialValues(user) : undefined,
  });
  useDirtyGuard("profile", isDirty);
  if (!user) return null;

  const avatar = watch("avatar");
  const about = watch("about") ?? "";
  const phoneField = register("phone");

  const onFile = (file?: File) => {
    setAvatarError("");
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type))
      return setAvatarError("Unsupported file type. Use JPG or PNG.");
    if (file.size > MAX_AVATAR)
      return setAvatarError(
        `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 2 MB.`,
      );
    const reader = new FileReader();
    reader.onload = () => setCropSrc(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <>
      <form
        id="profile-form"
        noValidate
        onSubmit={handleSubmit(async (values) => {
          await updateProfile({
            avatar: values.avatar || undefined,
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            phone: values.phone || undefined,
            wilaya: values.wilaya || undefined,
            commune: values.commune.trim() || undefined,
            about: values.about.trim(),
          });
          reset(values);
          show({ message: "Profile updated" });
        })}
      >
        <SettingsCard
          title="Profile"
          description="This information appears on your listings and public profile."
          formId="profile-form"
          dirty={isDirty}
          saving={isSubmitting}
          onCancel={() => reset()}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar
              src={avatar || undefined}
              name={`${user.firstName} ${user.lastName}`}
              className="size-24 text-2xl"
            />
            <div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInput.current?.click()}
                >
                  Upload photo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!avatar}
                  onClick={() => setValue("avatar", "", { shouldDirty: true })}
                >
                  Remove
                </Button>
              </div>
              <label htmlFor="avatar-file" className="sr-only">
                Upload profile photo
              </label>
              <input
                id="avatar-file"
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg"
                className="sr-only"
                aria-describedby="avatar-help"
                onChange={(event) => {
                  onFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <p
                id="avatar-help"
                aria-live="polite"
                className={cn(
                  "mt-2 text-xs",
                  avatarError ? "font-medium text-danger" : "text-text-secondary",
                )}
              >
                {avatarError || "JPG or PNG, max 2 MB. Square images look best."}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
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
              label="Phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              prefix="+213"
              placeholder="5XX XX XX XX"
              optional={!seller}
              error={errors.phone?.message}
              helper={
                seller ? "Required for sellers. Shared only with buyers you choose." : undefined
              }
              {...phoneField}
              onChange={(event) => {
                event.target.value = formatPhone(event.target.value);
                return phoneField.onChange(event);
              }}
            />
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
              <TextField
                label="Wilaya"
                list="settings-wilayas"
                placeholder="Search wilayas"
                autoComplete="off"
                error={errors.wilaya?.message}
                {...register("wilaya")}
              />
              <datalist id="settings-wilayas">
                {wilayas.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
              <TextField
                label="Commune"
                optional
                autoComplete="address-level2"
                error={errors.commune?.message}
                {...register("commune")}
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="about" className="text-sm font-semibold text-text-primary">
                About <span className="font-normal text-text-secondary">(optional)</span>
              </label>
              <textarea
                id="about"
                rows={4}
                maxLength={MAX_ABOUT}
                aria-describedby="about-help"
                aria-invalid={errors.about ? true : undefined}
                className="w-full resize-none rounded-button border bg-surface p-3 text-sm leading-6 text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                {...register("about")}
              />
              <div
                id="about-help"
                className="flex justify-between gap-4 text-xs text-text-secondary"
              >
                <span>
                  Tell buyers who you are, e.g. 'Car enthusiast selling my family's cars' or 'Small
                  dealership in Oran since 2015'.
                </span>
                <span className="price shrink-0">
                  {about.length} / {MAX_ABOUT}
                </span>
              </div>
            </div>
            {seller && (
              <a
                href={`/seller/${user.id}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-hover hover:underline"
              >
                Preview public profile <ArrowRight className="size-4" />
              </a>
            )}
          </div>
        </SettingsCard>
      </form>
      {cropSrc && (
        <AvatarCropDialog
          src={cropSrc}
          onClose={() => setCropSrc(null)}
          onApply={(url) => {
            setValue("avatar", url, { shouldDirty: true });
            setCropSrc(null);
          }}
        />
      )}
    </>
  );
}
