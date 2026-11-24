import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Contact,
  CreditCard,
  Eye,
  FileText,
  Focus,
  IdCard,
  Lock,
  ScanLine,
  ShieldCheck,
  Sun,
  X,
  XCircle,
} from "lucide-react";
import { DashboardLayout, isSellerRole } from "@/components/dashboard/DashboardLayout";
import { ReviewProgress } from "@/components/dashboard/VerificationStatusCard";
import { Stepper, verificationSteps } from "@/components/verification/Stepper";
import { UploadZone, formatSize, type UploadedFile } from "@/components/verification/UploadZone";
import { TextField, Checkbox } from "@/components/auth/FormField";
import { ListingCard } from "@/components/listings/ListingCard";
import { VerifiedBadge } from "@/components/common/Badges";
import { Avatar } from "@/components/ui/avatar";
import { Button, LinkButton } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { useGlobalToast } from "@/components/ui/toast";
import { useAuth, type AuthUser, type VerificationStatus } from "@/context/AuthContext";
import { useListings } from "@/context/ListingsContext";
import { defaultProfileFields, getSellerProfile } from "@/data/sellerProfiles";
import { wilayas } from "@/data/wilayas";
import { cn } from "@/lib/utils";

type IdType = "cni" | "passport" | "license";
type AddressDoc = "utility" | "residence" | "bank";

interface Draft {
  step: number;
  idType: IdType;
  idFiles: { front: UploadedFile | null; back: UploadedFile | null; photo: UploadedFile | null };
  addressDoc: AddressDoc;
  addressFile: UploadedFile | null;
  address: { line: string; commune: string; wilaya: string };
  confirmed: boolean;
}

const idTypes: { value: IdType; label: string; icon: typeof IdCard }[] = [
  { value: "cni", label: "National ID card (CNI biométrique)", icon: IdCard },
  { value: "passport", label: "Passport", icon: Contact },
  { value: "license", label: "Driver's license", icon: CreditCard },
];
const addressDocs: Record<AddressDoc, string> = {
  utility: "Utility bill (Sonelgaz, Algérie Télécom, water)",
  residence: "Residence certificate (certificat de résidence)",
  bank: "Bank statement",
};

const draftKey = (id: string) => `autohub:verificationDraft:${id}`;
const submissionKey = (id: string) => `autohub:verificationSubmission:${id}`;

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function writeJson(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Storage full (thumbnails) or unavailable: the draft just won't persist. */
  }
}

function emptyDraft(user: AuthUser): Draft {
  return {
    step: 0,
    idType: "cni",
    idFiles: { front: null, back: null, photo: null },
    addressDoc: "utility",
    addressFile: null,
    address: {
      line: "",
      commune: user.commune ?? "",
      wilaya: user.wilaya ?? defaultProfileFields(user.id).wilaya,
    },
    confirmed: false,
  };
}

const longDate = (iso?: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    iso ? new Date(iso) : new Date(),
  );

export function VerificationPage() {
  const { user, updateProfile } = useAuth();
  const [draft, setDraft] = useState<Draft | null>(() =>
    user ? readJson<Draft>(draftKey(user.id)) : null,
  );
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    if (user && draft) writeJson(draftKey(user.id), draft);
  }, [user, draft]);

  if (!user) return null;

  if (!isSellerRole(user.role))
    return (
      <DashboardLayout docTitle="Verification" title="Verification">
        <div className="max-w-xl rounded-card border bg-surface p-6 shadow-card">
          <span className="flex size-12 items-center justify-center rounded-full bg-navy-soft text-primary">
            <ShieldCheck className="size-6" />
          </span>
          <h2 className="mt-4 text-xl font-semibold leading-7">Verification is for sellers</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Buyers don't need to verify. Switch your account to seller to get the Verified badge on
            your listings.
          </p>
          <LinkButton href="/settings/account" variant="primary" className="mt-5">
            Switch to seller
          </LinkButton>
        </div>
      </DashboardLayout>
    );

  const status = user.verificationStatus;
  const inWizard = (status === "unverified" || status === "rejected") && draft !== null;
  const step = inWizard ? draft.step : -1;
  const docTitle = justSubmitted
    ? "Step 4 of 4 · Done · Verification"
    : inWizard
      ? `Step ${step + 1} of 4 · ${verificationSteps[step]} · Verification`
      : "Verification";

  const startFresh = () => setDraft(emptyDraft(user));
  const restartAfterRejection = () => {
    const previous = readJson<Draft>(submissionKey(user.id));
    // Keep step 1 (ID) and the address; only the rejected proof of address is cleared.
    setDraft(
      previous ? { ...previous, step: 0, addressFile: null, confirmed: false } : emptyDraft(user),
    );
  };

  const devToggle = (
    <label className="inline-flex items-center gap-2 rounded-button border border-dashed px-2.5 py-1 text-xs text-text-secondary">
      Dev: status
      <select
        value={status}
        onChange={(event) => {
          setJustSubmitted(false);
          setDraft(null);
          writeJson(draftKey(user.id), null);
          void updateProfile(
            { verificationStatus: event.target.value as VerificationStatus },
            { instant: true },
          );
        }}
        className="bg-transparent font-medium text-primary focus:outline-none"
      >
        <option value="unverified">None</option>
        <option value="pending">Pending</option>
        <option value="verified">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
    </label>
  );

  return (
    <DashboardLayout
      docTitle={docTitle}
      title={inWizard || justSubmitted || status === "unverified" ? "Get verified" : "Verification"}
      subtitle={
        status === "unverified" && !inWizard && !justSubmitted
          ? "Verified sellers get a trust badge on every listing and up to 3× more inquiries."
          : undefined
      }
      actions={devToggle}
    >
      {justSubmitted ? (
        <WizardFrame step={3}>
          <SubmittedView user={user} done />
        </WizardFrame>
      ) : inWizard ? (
        <Wizard
          user={user}
          draft={draft}
          setDraft={setDraft}
          onSubmitted={() => {
            writeJson(submissionKey(user.id), draft);
            writeJson(draftKey(user.id), null);
            setDraft(null);
            setJustSubmitted(true);
          }}
        />
      ) : status === "unverified" ? (
        <Intro user={user} onStart={startFresh} />
      ) : status === "pending" ? (
        <div className="mx-auto max-w-[45rem] rounded-card border bg-surface p-6 shadow-card sm:p-10">
          <SubmittedView user={user} />
        </div>
      ) : status === "verified" ? (
        <ApprovedView user={user} />
      ) : (
        <RejectedView onRestart={restartAfterRejection} />
      )}
    </DashboardLayout>
  );
}

function Intro({ user, onStart }: { user: AuthUser; onStart: () => void }) {
  const { listings } = useListings();
  const sample = listings.find((item) => item.seller.id === user.id) ?? listings[0];
  const steps = ["Upload your ID", "Add a proof of address", "We review within 48 hours"];
  return (
    <div className="grid gap-6">
      <div className="grid gap-8 rounded-card border bg-surface p-6 shadow-card md:grid-cols-2 sm:p-8">
        <div>
          <h2 className="text-xl font-semibold leading-7">How it works</h2>
          <ol className="mt-5 grid gap-5">
            {steps.map((label, index) => (
              <li key={label} className="flex items-center gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="font-medium text-text-primary">{label}</span>
              </li>
            ))}
          </ol>
        </div>
        <figure className="rounded-card bg-background p-5">
          <div className="mx-auto max-w-64 overflow-hidden rounded-card border bg-surface shadow-card">
            <img src={sample?.images[0]} alt="" className="aspect-video w-full object-cover" />
            <div className="p-3">
              <p className="truncate text-sm font-semibold text-text-primary">{sample?.title}</p>
              <div className="mt-2 flex items-center gap-2 text-xs font-medium text-text-primary">
                <Avatar
                  src={user.avatar}
                  name={`${user.firstName} ${user.lastName}`}
                  size="sm"
                  className="size-6"
                />
                <span className="truncate">
                  {user.firstName} {user.lastName.charAt(0)}.
                </span>
                <span className="rounded-full ring-2 ring-accent ring-offset-2">
                  <VerifiedBadge />
                </span>
              </div>
            </div>
          </div>
          <figcaption className="mt-3 text-center text-xs text-text-secondary">
            Your badge appears on every listing
          </figcaption>
        </figure>
      </div>

      <div className="flex gap-3 rounded-card bg-navy-soft p-5 text-sm text-primary">
        <Lock aria-hidden className="mt-0.5 size-5 shrink-0" />
        <p>
          Your documents are encrypted and only seen by our verification team. They're never shown
          to buyers.{" "}
          <a href="#" className="font-semibold text-accent-hover underline underline-offset-4">
            Read our privacy policy
          </a>
        </p>
      </div>

      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
        <Button variant="accent" size="lg" onClick={onStart}>
          Start verification
        </Button>
        <span className="text-sm text-text-secondary">Takes about 3 minutes</span>
      </div>
    </div>
  );
}

function WizardFrame({
  step,
  children,
  onExit,
}: {
  step: number;
  children: React.ReactNode;
  onExit?: () => void;
}) {
  return (
    <div className="mx-auto max-w-[45rem] rounded-card border bg-surface shadow-card">
      <div className="flex items-center gap-4 border-b px-5 py-4 sm:px-8">
        <div className="min-w-0 flex-1">
          <Stepper current={step} />
        </div>
        {onExit && (
          <Button variant="ghost" size="sm" onClick={onExit} className="shrink-0">
            Save and exit
          </Button>
        )}
      </div>
      <div className="p-5 sm:p-8">{children}</div>
    </div>
  );
}

function Wizard({
  user,
  draft,
  setDraft,
  onSubmitted,
}: {
  user: AuthUser;
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft | null>>;
  onSubmitted: () => void;
}) {
  const { updateProfile } = useAuth();
  const { flash } = useGlobalToast();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const update = (patch: Partial<Draft>) =>
    setDraft((current) => (current ? { ...current, ...patch } : current));
  const go = (step: number) => {
    update({ step });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const idReady =
    draft.idType === "passport"
      ? Boolean(draft.idFiles.photo)
      : Boolean(draft.idFiles.front && draft.idFiles.back);
  const addressReady =
    Boolean(draft.addressFile) &&
    draft.address.line.trim().length > 3 &&
    wilayas.includes(draft.address.wilaya);

  const submit = () => {
    let progress = 0;
    setUploadProgress(0);
    const timer = window.setInterval(async () => {
      progress = Math.min(100, progress + 8);
      setUploadProgress(progress);
      if (progress === 100) {
        window.clearInterval(timer);
        await updateProfile(
          { verificationStatus: "pending", verificationSubmittedAt: new Date().toISOString() },
          { instant: true },
        );
        onSubmitted();
      }
    }, 120);
  };

  return (
    <WizardFrame
      step={draft.step}
      onExit={() => {
        writeJson(draftKey(user.id), draft);
        flash("Draft saved. You can continue any time.");
        window.location.assign("/dashboard");
      }}
    >
      {draft.step === 0 && (
        <div className="grid gap-7">
          <StepHeading title="ID document" text="Choose the document you'd like to use." />
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-text-primary">Document type</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {idTypes.map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  className={cn(
                    "flex cursor-pointer flex-col gap-3 rounded-card border bg-surface p-4 text-sm font-medium text-text-primary hover:border-secondary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/30",
                    draft.idType === value && "border-accent bg-accent-soft hover:border-accent",
                  )}
                >
                  <input
                    type="radio"
                    name="id-type"
                    value={value}
                    checked={draft.idType === value}
                    onChange={() => update({ idType: value })}
                    className="sr-only"
                  />
                  <Icon aria-hidden className="size-6 text-primary" strokeWidth={1.5} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {draft.idType === "passport" ? (
            <UploadZone
              label="Photo page"
              value={draft.idFiles.photo}
              onChange={(file) => update({ idFiles: { ...draft.idFiles, photo: file } })}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <UploadZone
                label="Front"
                value={draft.idFiles.front}
                onChange={(file) => update({ idFiles: { ...draft.idFiles, front: file } })}
              />
              <UploadZone
                label="Back"
                value={draft.idFiles.back}
                onChange={(file) => update({ idFiles: { ...draft.idFiles, back: file } })}
              />
            </div>
          )}

          <PhotoTips />

          <StepActions continueDisabled={!idReady} onContinue={() => go(1)} />
        </div>
      )}

      {draft.step === 1 && (
        <div className="grid gap-6">
          <StepHeading
            title="Proof of address"
            text="We check that your address matches the name on your ID."
          />
          <div>
            <Select
              label="Document type"
              value={draft.addressDoc}
              onChange={(event) => update({ addressDoc: event.target.value as AddressDoc })}
            >
              {Object.entries(addressDocs).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <p className="mt-1.5 text-xs text-text-secondary">
              Must show your full name and address, dated within the last 3 months.
            </p>
          </div>
          <UploadZone
            label="Document"
            value={draft.addressFile}
            onChange={(file) => update({ addressFile: file })}
          />
          <div className="grid gap-5">
            <TextField
              label="Address line"
              autoComplete="address-line1"
              placeholder="e.g. 12 Rue Didouche Mourad"
              value={draft.address.line}
              onChange={(event) =>
                update({ address: { ...draft.address, line: event.target.value } })
              }
            />
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
              <TextField
                label="Commune"
                autoComplete="address-level2"
                value={draft.address.commune}
                onChange={(event) =>
                  update({ address: { ...draft.address, commune: event.target.value } })
                }
              />
              <TextField
                label="Wilaya"
                list="verification-wilayas"
                autoComplete="off"
                value={draft.address.wilaya}
                error={
                  draft.address.wilaya && !wilayas.includes(draft.address.wilaya)
                    ? "Choose a wilaya from the list"
                    : undefined
                }
                onChange={(event) =>
                  update({ address: { ...draft.address, wilaya: event.target.value } })
                }
              />
              <datalist id="verification-wilayas">
                {wilayas.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>
          </div>
          <StepActions
            continueDisabled={!addressReady}
            onContinue={() => go(2)}
            onBack={() => go(0)}
          />
        </div>
      )}

      {draft.step === 2 && (
        <div className="grid gap-6">
          <StepHeading title="Review" text="Check everything before you submit." />
          <SummaryCard title="ID document" onChange={() => go(0)}>
            <p className="text-sm text-text-primary">
              {idTypes.find((item) => item.value === draft.idType)?.label}
            </p>
            <FileRow
              files={
                draft.idType === "passport"
                  ? [draft.idFiles.photo]
                  : [draft.idFiles.front, draft.idFiles.back]
              }
            />
          </SummaryCard>
          <SummaryCard title="Proof of address" onChange={() => go(1)}>
            <p className="text-sm text-text-primary">{addressDocs[draft.addressDoc]}</p>
            <FileRow files={[draft.addressFile]} />
            <p className="mt-3 text-sm text-text-secondary">
              {draft.address.line}
              {draft.address.commune && `, ${draft.address.commune}`}, {draft.address.wilaya}
            </p>
          </SummaryCard>
          <Checkbox
            label="I confirm these documents are mine and the information is accurate."
            checked={draft.confirmed}
            onChange={(event) => update({ confirmed: event.target.checked })}
          />
          {uploadProgress !== null ? (
            <div role="status" aria-live="polite">
              <p className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <Lock aria-hidden className="size-4 text-secondary" />
                Uploading securely…
              </p>
              <div
                role="progressbar"
                aria-label="Uploading documents"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={uploadProgress}
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted-soft"
              >
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col-reverse gap-2 border-t pt-6 sm:flex-row sm:justify-between">
              <Button variant="ghost" onClick={() => go(1)}>
                Back
              </Button>
              <Button variant="accent" size="lg" disabled={!draft.confirmed} onClick={submit}>
                Submit for review
              </Button>
            </div>
          )}
        </div>
      )}
    </WizardFrame>
  );
}

function StepHeading({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold leading-8 text-text-primary">{title}</h2>
      <p className="mt-1 text-sm text-text-secondary">{text}</p>
    </div>
  );
}

function StepActions({
  continueDisabled,
  onContinue,
  onBack,
}: {
  continueDisabled: boolean;
  onContinue: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t pt-6 sm:flex-row sm:justify-between">
      {onBack ? (
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
      ) : (
        <LinkButton href="/dashboard" variant="ghost">
          Back
        </LinkButton>
      )}
      <Button onClick={onContinue} disabled={continueDisabled}>
        Continue
      </Button>
    </div>
  );
}

function PhotoTips() {
  const tips = [
    { icon: ScanLine, label: "All 4 corners visible" },
    { icon: Sun, label: "No glare or blur" },
    { icon: Eye, label: "Text readable" },
  ];
  return (
    <div className="grid gap-5 rounded-card bg-background p-5 sm:grid-cols-[1fr_auto] sm:items-center">
      <ul className="grid gap-2.5">
        {tips.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5 text-sm text-text-primary">
            <Icon aria-hidden className="size-4 text-secondary" />
            {label}
          </li>
        ))}
      </ul>
      <div className="flex gap-4" aria-hidden>
        <ExampleShape good />
        <ExampleShape />
      </div>
    </div>
  );
}

/** Simple drawn placeholder: a sharp card vs a blurry tilted card. No real ID imagery. */
function ExampleShape({ good = false }: { good?: boolean }) {
  return (
    <div className="text-center">
      <div className="relative flex h-16 w-24 items-center justify-center">
        <div
          className={cn(
            "h-14 w-22 rounded-md border-2 bg-surface p-1.5",
            good ? "border-primary" : "-rotate-12 border-secondary blur-[1.5px]",
          )}
        >
          <div className="flex gap-1.5">
            <span className="size-5 rounded-sm bg-navy-soft" />
            <span className="flex-1 space-y-1">
              <span className="block h-1 rounded-full bg-secondary/50" />
              <span className="block h-1 w-3/4 rounded-full bg-secondary/50" />
            </span>
          </div>
          <span className="mt-2 block h-1 rounded-full bg-secondary/40" />
        </div>
        <span
          className={cn(
            "absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full text-white",
            good ? "bg-success" : "bg-danger",
          )}
        >
          {good ? <CheckCircle2 className="size-3.5" /> : <X className="size-3.5" />}
        </span>
      </div>
      <p className="mt-1 text-xs text-text-secondary">{good ? "Good" : "Blurry"}</p>
    </div>
  );
}

function SummaryCard({
  title,
  onChange,
  children,
}: {
  title: string;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        <button
          onClick={onChange}
          className="text-sm font-semibold text-accent hover:text-accent-hover hover:underline"
        >
          Change<span className="sr-only"> {title.toLowerCase()}</span>
        </button>
      </div>
      {children}
    </section>
  );
}

function FileRow({ files }: { files: (UploadedFile | null)[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-3">
      {files.filter(Boolean).map((file) => (
        <li
          key={file!.name}
          className="flex items-center gap-2.5 rounded-button border bg-background p-2 pr-3"
        >
          {file!.preview ? (
            <img src={file!.preview} alt="" className="h-10 w-14 rounded-md object-cover" />
          ) : (
            <span className="flex h-10 w-14 items-center justify-center rounded-md bg-muted-soft text-primary">
              <FileText aria-hidden className="size-5" />
            </span>
          )}
          <span className="min-w-0">
            <span className="block max-w-40 truncate text-xs font-medium text-text-primary">
              {file!.name}
            </span>
            <span className="text-xs text-text-secondary">{formatSize(file!.size)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function SubmittedView({ user, done = false }: { user: AuthUser; done?: boolean }) {
  return (
    <div className="text-center" role={done ? "status" : undefined}>
      <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-success-soft text-success">
        <CheckCircle2 className="size-10" strokeWidth={1.75} />
      </span>
      <h2 className="mt-6 text-2xl font-bold leading-8 text-text-primary">
        {done ? "Documents submitted" : "Verification in review"}
      </h2>
      <p className="mt-2 text-text-secondary">
        {done
          ? "We'll review them within 48 hours and email you the result."
          : `Submitted ${longDate(user.verificationSubmittedAt)}. We usually review documents within 48 hours.`}
      </p>
      <div className="mt-6 flex justify-center">
        <ReviewProgress className="w-full" />
      </div>
      <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
        <LinkButton href="/dashboard" variant="primary" className="h-12 px-6">
          Back to dashboard
        </LinkButton>
        <LinkButton href="/dashboard/listings" variant="secondary" className="h-12 px-6">
          View my listings
        </LinkButton>
      </div>
      {!done && (
        <p className="mt-6 text-sm text-text-secondary">
          Need to change something?{" "}
          <a href="mailto:support@autohub.dz" className="font-semibold text-accent hover:underline">
            Contact support
          </a>
        </p>
      )}
    </div>
  );
}

function ApprovedView({ user }: { user: AuthUser }) {
  const { listings } = useListings();
  const listing = listings.find((item) => item.seller.id === user.id && item.status === "active");
  const verifiedOn = getSellerProfile(user.id)?.verifiedOn;
  return (
    <div className="mx-auto grid max-w-[45rem] gap-8 rounded-card border bg-surface p-6 shadow-card sm:p-10">
      <div className="text-center">
        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-success-soft text-success">
          <ShieldCheck className="size-10" strokeWidth={1.75} />
        </span>
        <h2 className="mt-6 text-2xl font-bold leading-8 text-text-primary">You're verified</h2>
        <p className="mt-2 text-text-secondary">Verified on {longDate(verifiedOn)}</p>
      </div>
      {listing && (
        <div className="mx-auto w-full max-w-xs">
          <p className="mb-2 text-center text-xs font-medium text-text-secondary">
            How buyers see your listings
          </p>
          <ListingCard listing={listing} />
        </div>
      )}
      <div className="flex justify-center">
        <LinkButton href={`/seller/${user.id}`} variant="primary" className="h-12 px-6">
          View my public profile
        </LinkButton>
      </div>
    </div>
  );
}

function RejectedView({ onRestart }: { onRestart: () => void }) {
  const fixes = [
    "Upload a utility bill, residence certificate or bank statement dated within the last 3 months.",
    "Make sure your full name and address are clearly visible.",
    "Take the photo in good light, with all 4 corners in the frame.",
  ];
  return (
    <div className="mx-auto grid max-w-[45rem] gap-6">
      <div role="alert" className="flex gap-4 rounded-card bg-danger/10 p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface text-danger">
          <XCircle className="size-6" />
        </span>
        <div>
          <h2 className="font-semibold text-text-primary">Verification was not approved</h2>
          <p className="mt-1 text-sm text-muted">
            Reason from our team: The proof of address is older than 3 months.
          </p>
        </div>
      </div>
      <div className="rounded-card border bg-surface p-6 shadow-card">
        <h3 className="flex items-center gap-2 text-base font-semibold text-text-primary">
          <AlertTriangle aria-hidden className="size-5 text-warning" />
          What to fix
        </h3>
        <ul className="mt-4 grid gap-3">
          {fixes.map((fix) => (
            <li key={fix} className="flex gap-2.5 text-sm text-text-primary">
              <Focus aria-hidden className="mt-0.5 size-4 shrink-0 text-secondary" />
              {fix}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-text-secondary">
          Your ID document is kept, so you only need to replace the proof of address.
        </p>
        <Button className="mt-6" onClick={onRestart}>
          Start again
        </Button>
      </div>
    </div>
  );
}
