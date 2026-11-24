import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Flag,
  Fuel,
  Gauge,
  Heart,
  MapPin,
  MessageSquare,
  Pencil,
  SearchX,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { Button, LinkButton } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Toast, useToast } from "@/components/ui/toast";
import {
  ListingTypeBadge,
  NewBadge,
  StatusBadge,
  UnverifiedBadge,
  VerifiedBadge,
} from "@/components/common/Badges";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingGallery, ListingGallerySkeleton } from "@/components/listing-detail/ListingGallery";
import { ContactSellerModal } from "@/components/listing-detail/ContactSellerModal";
import { ReportListingModal } from "@/components/listing-detail/ReportListingModal";
import { ShareMenu } from "@/components/listing-detail/ShareMenu";
import { mockListings, type Listing, type ListingStatus } from "@/data/mockListings";
import { cn, formatNumber, relativeDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useListings } from "@/context/ListingsContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useGlobalToast } from "@/components/ui/toast";

type Period = "daily" | "weekly" | "monthly";
const periodLabel: Record<Period, string> = { daily: "day", weekly: "week", monthly: "month" };

export function ListingDetailPage({ id }: { id: string }) {
  const { getListing, setStatus: setListingStatus, deleteListing } = useListings();
  const favorites = useFavorites();
  const listing = getListing(id);
  const initialParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const { user } = useAuth();
  const loggedIn = Boolean(user);
  const [owner, setOwner] = useState(initialParams.get("owner") === "1");
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [confirm, setConfirm] = useState<"status" | "delete" | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const { toast, show, dismiss } = useToast();
  const { flash } = useGlobalToast();

  useEffect(() => {
    document.title = `${listing ? fullTitle(listing) : "Listing not found"} · 33-AutoHub`;
    const timer = window.setTimeout(() => {
      setLoading(false);
      if (initialParams.get("contact") === "1" && listing) setContactOpen(true);
    }, 500);
    return () => window.clearTimeout(timer);
  }, []);

  const setDevParam = (key: "owner", value: boolean) => {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, "1");
    else next.delete(key);
    next.delete("contact");
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${next.size ? `?${next}` : ""}`,
    );
  };

  if (!listing) return <NotFound />;

  // Owner view is automatic for the seller; the dev toggle remains as a fallback.
  const isOwner = user?.id === listing.seller.id || owner;
  const status: ListingStatus = listing.status;
  const setStatus = (next: ListingStatus) => setListingStatus(listing.id, next);
  const saved = favorites.isFavorite(listing.id);
  const inactive = status !== "active";
  const closedLabel = listing.type === "rent" ? "rented" : "sold";
  const typePath = listing.type === "rent" ? "Rent" : "Buy";
  const lastSearch = sessionStorage.getItem("autohub:lastSearch");
  const backToSearch =
    lastSearch &&
    new URLSearchParams(lastSearch.split("?")[1]).get("type") !==
      (listing.type === "rent" ? "sale" : "rent")
      ? lastSearch
      : `/search?type=${listing.type}`;

  const markClosed = () => {
    setConfirm(null);
    setStatus(closedLabel);
    setAnnouncement(`Listing marked as ${closedLabel}`);
    show({
      message: `Listing marked as ${closedLabel}.`,
      actionLabel: "Undo",
      onAction: () => {
        setStatus("active");
        setAnnouncement("Listing is active again");
      },
    });
  };

  const toggleSave = () => {
    favorites.toggleFavorite(listing.id);
    if (user) setAnnouncement(saved ? "Removed from saved listings" : "Listing saved");
  };

  const openContact = () => setContactOpen(true);
  const scrollToSimilar = () =>
    document.getElementById("similar")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <Navbar />
      <main className="pb-28 lg:pb-0">
        <Container className="py-6 lg:py-8">
          <DevToggles
            owner={owner}
            onOwner={(value) => {
              setOwner(value);
              setDevParam("owner", value);
            }}
          />

          <div className="flex items-center justify-between gap-4">
            <nav aria-label="Breadcrumb" className="min-w-0 truncate text-sm text-text-secondary">
              <a href="/" className="hover:text-accent">
                Home
              </a>
              <span className="mx-2">/</span>
              <a href={backToSearch} className="hover:text-accent">
                {typePath}
              </a>
              <span className="mx-2">/</span>
              <a
                href={`/search?type=${listing.type}&make=${encodeURIComponent(listing.make)}`}
                className="hover:text-accent"
              >
                {listing.make}
              </a>
              <span className="mx-2">/</span>
              <span aria-current="page" className="font-medium text-primary">
                {listing.model}
              </span>
            </nav>
            <div className="flex shrink-0 items-center gap-1">
              <div className="hidden items-center gap-1 lg:flex">
                <ShareMenu
                  title={listing.title}
                  onCopied={() => show({ message: "Link copied" })}
                />
                <Tooltip label="Report listing">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Report listing"
                    onClick={() => setReportOpen(true)}
                  >
                    <Flag className="size-5" />
                  </Button>
                </Tooltip>
              </div>
              <div className="lg:hidden">
                <ShareMenu
                  mobile
                  title={listing.title}
                  onCopied={() => show({ message: "Link copied" })}
                  onReport={() => setReportOpen(true)}
                />
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-card bg-navy-soft px-5 py-4 text-sm text-primary">
              <span className="font-semibold">This is your listing</span>
              {status === "active" ? (
                <span className="inline-flex items-center rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
                  Active
                </span>
              ) : (
                <StatusBadge status={status} />
              )}
              <span className="text-text-secondary sm:ml-auto">
                Last updated {relativeDate(listing.updatedAt).toLowerCase()}
              </span>
            </div>
          )}

          {inactive && (
            <div className="mt-5 flex flex-col gap-3 rounded-card bg-muted-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold text-muted">This car has been {status}</p>
              <Button variant="secondary" size="sm" onClick={scrollToSimilar}>
                See similar cars
              </Button>
            </div>
          )}

          <p aria-live="polite" className="sr-only">
            {announcement}
          </p>

          {loading ? (
            <DetailSkeleton />
          ) : (
            <div className="mt-5 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <ListingGallery listing={listing} inactive={inactive} />
              </div>

              <div className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
                <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:rounded-card lg:border lg:bg-surface lg:p-6 lg:shadow-card">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <ListingTypeBadge type={listing.type} />
                      {Date.now() - new Date(listing.createdAt).getTime() < 48 * 3600000 && (
                        <NewBadge />
                      )}
                      {inactive && <StatusBadge status={status as "sold" | "rented"} />}
                    </div>
                    <PriceBlock listing={listing} inactive={inactive} />
                    <h1 className="mt-3 text-2xl font-bold leading-8 text-text-primary lg:text-[1.75rem] lg:leading-9">
                      {fullTitle(listing)}
                    </h1>
                    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-4 text-secondary" />
                        {listing.location}
                      </span>
                      <span aria-hidden>·</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-4 text-secondary" />
                        Posted {relativeDate(listing.createdAt).toLowerCase()}
                      </span>
                      <span aria-hidden>·</span>
                      <span className="flex items-center gap-1.5">
                        <Eye className="size-4 text-secondary" />
                        {formatNumber(listing.views)} views
                      </span>
                    </p>
                  </div>

                  <KeySpecs listing={listing} />

                  {isOwner ? (
                    <OwnerActions
                      listing={listing}
                      status={status}
                      onMark={() => (inactive ? setStatus("active") : setConfirm("status"))}
                      onDelete={() => setConfirm("delete")}
                    />
                  ) : (
                    <div className="hidden gap-3 lg:grid">
                      <ContactButton disabled={inactive} onClick={openContact} size="lg" />
                      <Button
                        variant="secondary"
                        size="lg"
                        aria-pressed={saved}
                        onClick={toggleSave}
                      >
                        <Heart className={cn("size-5", saved && "fill-danger text-danger")} />
                        {saved ? "Saved" : "Save listing"}
                      </Button>
                    </div>
                  )}

                  {listing.rentalConditions && (
                    <RentalConditions listing={listing} className="order-2 lg:order-none" />
                  )}

                  <div className="order-1 lg:order-none lg:border-t lg:pt-6">
                    <SellerCard listing={listing} />
                    {!listing.seller.isVerified && !isOwner && (
                      <div
                        role="note"
                        className="mt-4 flex gap-3 rounded-card bg-warning-soft p-4 text-sm leading-6 text-warning"
                      >
                        <ShieldAlert className="mt-0.5 size-5 shrink-0" />
                        <p>
                          This seller hasn't verified their identity yet. Take extra care before
                          paying anything.{" "}
                          <a href="#safety" className="font-semibold underline underline-offset-4">
                            Safety tips
                          </a>
                        </p>
                      </div>
                    )}
                    {isOwner && !listing.seller.isVerified && (
                      <div className="mt-4 rounded-card bg-accent-soft p-4">
                        <p className="text-sm font-semibold text-primary">
                          Get verified to build trust and get more inquiries
                        </p>
                        <LinkButton
                          href="/verification"
                          variant="primary"
                          className="mt-3 h-8 px-3"
                        >
                          Start verification
                        </LinkButton>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-12 lg:col-span-7 lg:row-start-2">
                <Specifications listing={listing} />
                <Description text={listing.description} />
                <Features features={listing.features} />
                <LocationBlock listing={listing} />
                <SafetyTips onReport={() => setReportOpen(true)} />
              </div>
            </div>
          )}
        </Container>

        <SimilarCars listing={listing} />
      </main>
      <Footer />

      {!loading && (
        <MobileActionBar
          listing={listing}
          inactive={inactive}
          isOwner={isOwner}
          saved={saved}
          closedLabel={closedLabel}
          onSave={toggleSave}
          onContact={openContact}
          onMark={() => (inactive ? setStatus("active") : setConfirm("status"))}
        />
      )}

      {contactOpen && (
        <ContactSellerModal
          listing={listing}
          loggedIn={loggedIn}
          onClose={() => setContactOpen(false)}
        />
      )}
      {reportOpen && (
        <ReportListingModal
          onClose={() => setReportOpen(false)}
          onSubmitted={() => {
            setReportOpen(false);
            show({ message: "Thanks. Our team will review this listing." });
          }}
        />
      )}
      {confirm === "status" && (
        <ConfirmDialog
          title={`Mark as ${closedLabel}?`}
          description={`Buyers will see this listing as ${closedLabel} and won't be able to contact you about it.`}
          confirmLabel={`Mark as ${closedLabel}`}
          onConfirm={markClosed}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm === "delete" && (
        <ConfirmDialog
          title="Delete this listing? This can't be undone."
          description="The listing, its photos and its statistics will be permanently removed."
          confirmLabel="Delete"
          destructive
          onConfirm={() => {
            setConfirm(null);
            deleteListing(listing.id);
            flash("Listing deleted.");
            window.location.assign(
              isOwner && user ? "/dashboard/listings" : `/search?type=${listing.type}`,
            );
          }}
          onClose={() => setConfirm(null)}
        />
      )}
      <Toast toast={toast} onDismiss={dismiss} />
    </>
  );
}

function fullTitle(listing: Listing) {
  return listing.trim ? `${listing.title} ${listing.trim}` : listing.title;
}

function priceFor(listing: Listing, period: Period = "daily") {
  return listing.type === "rent" ? listing.rentalPrice[period] : listing.price;
}

function PriceBlock({ listing, inactive }: { listing: Listing; inactive: boolean }) {
  const [period, setPeriod] = useState<Period>("daily");
  const price = priceFor(listing, period);
  const days = period === "weekly" ? 7 : 30;
  const saving =
    period === "daily" ? 0 : Math.round((1 - price / (listing.rentalPrice.daily * days)) * 100);

  return (
    <div className="mt-4">
      {listing.type === "rent" && (
        <Tabs
          className="mb-4 grid w-full grid-cols-3 sm:w-auto"
          items={[
            { value: "daily", label: "Day" },
            { value: "weekly", label: "Week" },
            { value: "monthly", label: "Month" },
          ]}
          value={period}
          onChange={setPeriod}
        />
      )}
      <div aria-live="polite">
        <p className="flex flex-wrap items-baseline gap-1.5">
          <span
            className={cn(
              "price text-[2rem] font-bold leading-10 text-primary",
              inactive && "text-text-secondary line-through",
            )}
          >
            {formatNumber(price)} DA
          </span>
          {listing.type === "rent" && (
            <span className="text-base text-text-secondary">/ {periodLabel[period]}</span>
          )}
          {inactive && <span className="sr-only">No longer available</span>}
        </p>
        {saving > 0 && (
          <p className="mt-1 text-sm font-medium text-success">Save {saving}% vs daily</p>
        )}
        {listing.type === "sale" && listing.negotiable && (
          <p className="mt-1 text-sm text-text-secondary">Price negotiable</p>
        )}
      </div>
    </div>
  );
}

function KeySpecs({ listing }: { listing: Listing }) {
  const specs = [
    { icon: Calendar, label: "Year", value: String(listing.year) },
    { icon: Gauge, label: "Mileage", value: `${formatNumber(listing.mileage)} km` },
    { icon: Fuel, label: "Fuel", value: capitalize(listing.fuelType) },
    { icon: Settings2, label: "Transmission", value: capitalize(listing.transmission) },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3">
      {specs.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-3 rounded-card border bg-background p-3">
          <Icon className="size-5 shrink-0 text-secondary" strokeWidth={1.75} />
          <div className="min-w-0">
            <dt className="text-xs font-medium text-text-secondary">{label}</dt>
            <dd className="truncate text-sm font-semibold text-text-primary">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

function ContactButton({
  disabled,
  onClick,
  size = "lg",
  className,
}: {
  disabled: boolean;
  onClick: () => void;
  size?: "md" | "lg";
  className?: string;
}) {
  const hintId = useId();
  const button = (
    <Button
      variant="accent"
      size={size}
      disabled={disabled}
      onClick={onClick}
      className={cn("w-full", className)}
      aria-describedby={disabled ? hintId : undefined}
    >
      <MessageSquare className="size-5" />
      Contact seller
    </Button>
  );
  if (!disabled) return button;
  return (
    <Tooltip label="This listing is no longer available">
      <span className="block w-full">
        {button}
        <span id={hintId} className="sr-only">
          This listing is no longer available
        </span>
      </span>
    </Tooltip>
  );
}

function OwnerActions({
  listing,
  status,
  onMark,
  onDelete,
}: {
  listing: Listing;
  status: ListingStatus;
  onMark: () => void;
  onDelete: () => void;
}) {
  const stats = [
    { icon: Eye, label: "Views", value: listing.views },
    { icon: MessageSquare, label: "Inquiries", value: listing.inquiries },
    { icon: Heart, label: "Saves", value: listing.saves },
  ];
  return (
    <div className="grid gap-3">
      <dl className="grid grid-cols-3 gap-2 rounded-card border bg-background p-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="text-center">
            <dt className="flex items-center justify-center gap-1 text-xs font-medium text-text-secondary">
              <Icon className="size-3.5" />
              {label}
            </dt>
            <dd className="price mt-0.5 text-lg font-bold text-primary">{formatNumber(value)}</dd>
          </div>
        ))}
      </dl>
      <LinkButton
        href={`/listing/${listing.id}/edit`}
        variant="primary"
        className="hidden h-12 lg:inline-flex"
      >
        <Pencil className="size-4" />
        Edit listing
      </LinkButton>
      <Button variant="secondary" size="lg" onClick={onMark} className="hidden lg:inline-flex">
        {status === "active"
          ? `Mark as ${listing.type === "rent" ? "rented" : "sold"}`
          : "Mark as active"}
      </Button>
      <Button variant="ghost" onClick={onDelete} className="text-danger hover:bg-danger/5">
        <Trash2 className="size-4" />
        Delete listing
      </Button>
    </div>
  );
}

function RentalConditions({ listing, className }: { listing: Listing; className?: string }) {
  const conditions = listing.rentalConditions!;
  const items = [
    `Minimum rental: ${conditions.minimumDuration}`,
    `Deposit: ${formatNumber(conditions.deposit)} DA`,
    `Driver aged ${conditions.minDriverAge} or older`,
    `Driving license held for ${conditions.licenseYears}+ years`,
  ];
  return (
    <div className={cn("rounded-card bg-muted-soft p-4", className)}>
      <h2 className="text-sm font-semibold text-primary">Rental conditions</h2>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-muted">
            <Check className="size-4 shrink-0 text-success" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SellerCard({ listing }: { listing: Listing }) {
  const { seller } = listing;
  const active = mockListings.filter(
    (item) => item.seller.id === seller.id && item.status === "active",
  ).length;
  const since = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
    new Date(seller.memberSince),
  );
  return (
    <div className="flex gap-3 rounded-card border bg-surface p-4 lg:border-0 lg:p-0">
      <a href={`/seller/${seller.id}`} aria-label={`${seller.name} profile`} className="shrink-0">
        <Avatar src={seller.avatar} name={seller.name} className="size-12" />
      </a>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/seller/${seller.id}`}
            className="text-base font-semibold text-text-primary hover:text-accent hover:underline"
          >
            {seller.name}
          </a>
          {seller.isVerified ? <VerifiedBadge /> : <UnverifiedBadge />}
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          Member since {since} · {active} active listings
        </p>
        <a
          href={`/seller/${seller.id}`}
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-hover hover:underline"
        >
          View seller profile <ArrowRight className="size-4" />
        </a>
      </div>
    </div>
  );
}

function Specifications({ listing }: { listing: Listing }) {
  const rows = [
    ["Make", listing.make],
    ["Model", listing.model],
    ["Year", String(listing.year)],
    ["Mileage", `${formatNumber(listing.mileage)} km`],
    ["Fuel type", capitalize(listing.fuelType)],
    ["Transmission", capitalize(listing.transmission)],
    ["Body type", listing.bodyType === "suv" ? "SUV" : capitalize(listing.bodyType)],
    ["Color", listing.color],
    ["Listing type", listing.type === "rent" ? "For rent" : "For sale"],
    ["Location", listing.location],
    ["Listing ID", listing.id.toUpperCase()],
  ];
  return (
    <section aria-labelledby="specs-title">
      <h2 id="specs-title" className="text-2xl font-bold leading-8">
        Specifications
      </h2>
      <dl className="mt-5 overflow-hidden rounded-card border">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-2 gap-4 px-4 py-3 text-sm odd:bg-background even:bg-surface"
          >
            <dt className="text-text-secondary">{label}</dt>
            <dd className="font-medium text-text-primary">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Description({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section aria-labelledby="description-title">
      <h2 id="description-title" className="text-2xl font-bold leading-8">
        Description
      </h2>
      <p
        id="description-text"
        className={cn("mt-4 leading-7 text-text-primary", !expanded && "line-clamp-6")}
      >
        {text}
      </p>
      <Button
        variant="link"
        className="mt-2 px-0"
        aria-expanded={expanded}
        aria-controls="description-text"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Show less" : "Read more"}
      </Button>
    </section>
  );
}

function Features({ features }: { features: string[] }) {
  const [all, setAll] = useState(false);
  const visible = all ? features : features.slice(0, 9);
  return (
    <section aria-labelledby="features-title">
      <h2 id="features-title" className="text-2xl font-bold leading-8">
        Features
      </h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5 text-sm text-text-primary">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-hover">
              <Check className="size-3.5" strokeWidth={2.5} />
            </span>
            {feature}
          </li>
        ))}
      </ul>
      {features.length > 9 && (
        <Button variant="link" className="mt-3 px-0" onClick={() => setAll(!all)}>
          {all ? "Show fewer features" : `Show all ${features.length} features`}
        </Button>
      )}
    </section>
  );
}

function LocationBlock({ listing }: { listing: Listing }) {
  return (
    <section aria-labelledby="location-title">
      <h2 id="location-title" className="text-2xl font-bold leading-8">
        Location
      </h2>
      <p className="mt-3 text-text-primary">
        {listing.commune}, {listing.location}
      </p>
      <div
        role="img"
        aria-label={`Approximate location: ${listing.location}`}
        className="mt-4 flex aspect-[21/9] flex-col items-center justify-center gap-2 rounded-card border bg-muted-soft"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-surface text-primary shadow-card">
          <MapPin className="size-6" />
        </span>
        <span className="text-sm font-semibold text-primary">{listing.location}</span>
      </div>
      <p className="mt-3 text-sm text-text-secondary">
        Exact address is shared by the seller in messages.
      </p>
    </section>
  );
}

function SafetyTips({ onReport }: { onReport: () => void }) {
  const tips = [
    "Meet in a public place",
    "Inspect the car and papers (carte grise) before paying",
    "Never send a deposit before seeing the car",
    "Keep the conversation on 33-AutoHub",
  ];
  return (
    <section
      id="safety"
      aria-labelledby="safety-title"
      className="scroll-mt-28 rounded-card bg-accent-soft p-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-surface text-success">
          <ShieldCheck className="size-5" />
        </span>
        <h2 id="safety-title" className="text-xl font-semibold leading-7 text-primary">
          Safety tips
        </h2>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2 text-sm leading-6 text-primary">
            <Check className="mt-1 size-4 shrink-0 text-accent-hover" />
            {tip}
          </li>
        ))}
      </ul>
      <button
        onClick={onReport}
        className="mt-4 text-sm font-semibold text-accent-hover underline-offset-4 hover:underline"
      >
        Report this listing
      </button>
    </section>
  );
}

function SimilarCars({ listing }: { listing: Listing }) {
  const track = useRef<HTMLDivElement>(null);
  const similar = mockListings
    .filter((item) => item.id !== listing.id && item.type === listing.type)
    .map((item) => ({
      item,
      score:
        (item.bodyType === listing.bodyType ? 0 : 1) +
        Math.abs(priceFor(item) - priceFor(listing)) / Math.max(priceFor(listing), 1) +
        (item.status === "active" ? 0 : 2),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 8)
    .map(({ item }) => item);
  const scroll = (direction: number) =>
    track.current?.scrollBy({
      left: direction * track.current.clientWidth * 0.8,
      behavior: "smooth",
    });

  return (
    <section id="similar" className="scroll-mt-24 border-t bg-surface py-16 lg:py-24">
      <Container>
        <SectionHeader
          title="Similar cars"
          link={`/search?type=${listing.type}&make=${encodeURIComponent(listing.make)}&body=${listing.bodyType}`}
        />
        <div className="relative">
          <div
            ref={track}
            className="horizontal-scroll -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:gap-6 lg:mx-0 lg:px-0"
          >
            {similar.map((item) => (
              <div
                key={item.id}
                className="w-[82%] shrink-0 snap-start sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]"
              >
                <ListingCard listing={item} />
              </div>
            ))}
          </div>
          <div className="mt-6 hidden justify-end gap-2 lg:flex">
            <Button
              variant="secondary"
              size="icon"
              aria-label="Previous similar cars"
              onClick={() => scroll(-1)}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Next similar cars"
              onClick={() => scroll(1)}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

function MobileActionBar({
  listing,
  inactive,
  isOwner,
  saved,
  closedLabel,
  onSave,
  onContact,
  onMark,
}: {
  listing: Listing;
  inactive: boolean;
  isOwner: boolean;
  saved: boolean;
  closedLabel: string;
  onSave: () => void;
  onContact: () => void;
  onMark: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <p className="min-w-0 flex-1">
          <span
            className={cn(
              "price block truncate text-lg font-bold text-primary",
              inactive && "text-text-secondary line-through",
            )}
          >
            {formatNumber(priceFor(listing))} DA
          </span>
          {listing.type === "rent" && <span className="text-xs text-text-secondary">per day</span>}
        </p>
        {isOwner ? (
          <>
            <LinkButton
              href={`/listing/${listing.id}/edit`}
              variant="secondary"
              className="h-10 px-4"
            >
              <Pencil className="size-4" />
              Edit
            </LinkButton>
            <Button variant="primary" onClick={onMark}>
              {inactive ? "Mark active" : `Mark as ${closedLabel}`}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              size="icon"
              aria-label={saved ? "Remove from saved" : "Save listing"}
              aria-pressed={saved}
              onClick={onSave}
            >
              <Heart className={cn("size-5", saved && "fill-danger text-danger")} />
            </Button>
            <div className="w-auto">
              <ContactButton disabled={inactive} onClick={onContact} size="md" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DevToggles({ owner, onOwner }: { owner: boolean; onOwner: (value: boolean) => void }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-card border border-dashed bg-surface px-4 py-2.5 text-xs font-medium text-text-secondary">
      <span className="uppercase tracking-wider">Dev preview</span>
      <Switch label="View as owner" checked={owner} onChange={onOwner} />
      <span>Log in as seller@autohub.dz to see owner view automatically.</span>
    </div>
  );
}

function Switch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-primary">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-5 w-9 rounded-full", checked ? "bg-accent" : "bg-secondary")}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white transition",
            checked ? "left-4.5" : "left-0.5",
          )}
        />
      </button>
      {label}
    </label>
  );
}

function DetailSkeleton() {
  return (
    <div className="mt-5 grid gap-8 lg:grid-cols-12" aria-label="Loading listing" aria-busy>
      <div className="lg:col-span-7">
        <ListingGallerySkeleton />
        <div className="mt-12 space-y-3">
          <Skeleton className="h-8 w-48" />
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
          <Skeleton className="mt-9 h-8 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="space-y-5 rounded-card border bg-surface p-6 lg:col-span-5 lg:self-start">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

function NotFound() {
  useEffect(() => {
    document.title = "Listing not found · 33-AutoHub";
  }, []);
  return (
    <>
      <Navbar />
      <main>
        <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-muted-soft text-primary">
            <SearchX className="size-7" />
          </span>
          <h2 className="mt-5 text-2xl font-bold leading-8">Listing not found</h2>
          <p className="mt-2 text-text-secondary">This listing may have been removed.</p>
          <LinkButton href="/search" variant="primary" className="mt-6">
            Browse cars
          </LinkButton>
        </Container>
      </main>
      <Footer />
    </>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
