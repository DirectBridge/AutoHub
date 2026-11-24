import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Clock,
  Flag,
  Info,
  MapPin,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  UserRoundX,
  UserX,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { Avatar } from "@/components/ui/avatar";
import { Button, LinkButton } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useGlobalToast } from "@/components/ui/toast";
import { UnverifiedBadge, VerifiedBadge } from "@/components/common/Badges";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/ListingCard";
import { ShareMenu } from "@/components/listing-detail/ShareMenu";
import { ReportListingModal } from "@/components/listing-detail/ReportListingModal";
import { ActionMenu } from "@/components/dashboard/ActionMenu";
import { useSimulatedLoading } from "@/components/dashboard/DashboardWidgets";
import { useAuth } from "@/context/AuthContext";
import { useBlockedUsers } from "@/context/BlockedUsersContext";
import { useListings } from "@/context/ListingsContext";
import { getSellerProfile } from "@/data/sellerProfiles";
import { cn } from "@/lib/utils";

type Tab = "sale" | "rent" | "sold";
const perPage = 9;
const userReportReasons = ["Scam or fraud", "Fake identity", "Abusive behavior", "Spam", "Other"];
const longDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(iso),
  );
const monthYear = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(iso));

export function SellerProfilePage({ id }: { id: string }) {
  const profile = getSellerProfile(id);
  const { user } = useAuth();
  const { listings } = useListings();
  const { isBlocked, block } = useBlockedUsers();
  const { show } = useGlobalToast();
  const loading = useSimulatedLoading();
  const [tab, setTab] = useState<Tab>("sale");
  const [page, setPage] = useState(1);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);

  useEffect(() => {
    document.title = `${profile ? profile.name : "Seller not found"} · 33-AutoHub`;
  }, [profile?.name]);
  useEffect(() => setPage(1), [tab]);

  if (!profile) return <SellerNotFound />;

  const own = user?.id === profile.id;
  const mine = listings.filter((item) => item.seller.id === profile.id);
  const groups: Record<Tab, typeof mine> = {
    sale: mine.filter((item) => item.type === "sale" && item.status === "active"),
    rent: mine.filter((item) => item.type === "rent" && item.status === "active"),
    sold: mine.filter((item) => item.status !== "active"),
  };
  const shown = groups[tab];
  const totalPages = Math.max(1, Math.ceil(shown.length / perPage));
  const pageItems = shown.slice((page - 1) * perPage, page * perPage);
  const activeCount = groups.sale.length + groups.rent.length;
  const blocked = isBlocked(profile.id);

  return (
    <>
      <Navbar />
      <main>
        {own && (
          <div className="border-b bg-navy-soft">
            <Container className="flex items-center gap-2 py-2.5 text-sm text-primary">
              <Info aria-hidden className="size-4" />
              This is how buyers see your profile
            </Container>
          </div>
        )}

        <section className="border-b bg-surface">
          <Container className="py-8 lg:py-10">
            {loading ? (
              <HeaderSkeleton />
            ) : (
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 flex-col gap-5 sm:flex-row">
                  <Avatar
                    src={profile.avatar}
                    name={profile.name}
                    className="size-24 shrink-0 text-2xl"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-[2rem] font-bold leading-10 text-text-primary">
                        {profile.name}
                      </h1>
                      {profile.isVerified ? <VerifiedBadge /> : <UnverifiedBadge />}
                      {profile.isDealership && (
                        <span className="inline-flex items-center rounded-full bg-navy-soft px-2.5 py-1 text-xs font-medium text-primary">
                          Dealership
                        </span>
                      )}
                    </div>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
                      {profile.wilaya && (
                        <>
                          <span className="flex items-center gap-1.5">
                            <MapPin aria-hidden className="size-4 text-secondary" />
                            {profile.wilaya}
                          </span>
                          <span aria-hidden>·</span>
                        </>
                      )}
                      <span className="flex items-center gap-1.5">
                        <CalendarDays aria-hidden className="size-4 text-secondary" />
                        Member since {monthYear(profile.memberSince)}
                      </span>
                      <span aria-hidden>·</span>
                      <span className="flex items-center gap-1.5">
                        <Clock aria-hidden className="size-4 text-secondary" />
                        {profile.replyTime}
                      </span>
                    </p>
                    {profile.about && (
                      <div className="mt-4 max-w-2xl">
                        <p
                          id="seller-about"
                          className={cn(
                            "leading-7 text-text-primary",
                            !aboutOpen && "line-clamp-3",
                          )}
                        >
                          {profile.about}
                        </p>
                        {profile.about.length > 180 && (
                          <Button
                            variant="link"
                            className="mt-1 px-0"
                            aria-expanded={aboutOpen}
                            aria-controls="seller-about"
                            onClick={() => setAboutOpen(!aboutOpen)}
                          >
                            {aboutOpen ? "Show less" : "Read more"}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-4 lg:items-end">
                  <dl className="flex divide-x rounded-card border bg-background">
                    <Stat label="Active listings" value={String(activeCount)} />
                    <Stat label="Cars sold" value={String(profile.soldCount)} />
                    <Stat label="Response rate" value={`${profile.responseRate}%`} />
                  </dl>
                  {own ? (
                    <LinkButton
                      href="/settings/profile"
                      variant="secondary"
                      className="self-start lg:self-end"
                    >
                      <Pencil className="size-4" />
                      Edit profile
                    </LinkButton>
                  ) : (
                    <div className="flex items-center gap-1 self-start lg:self-end">
                      <ShareMenu
                        title={profile.name}
                        onCopied={() => show({ message: "Link copied" })}
                      />
                      <ActionMenu
                        label="More actions"
                        items={[
                          { label: "Report user", icon: Flag, onSelect: () => setReportOpen(true) },
                          ...(user && !blocked
                            ? [
                                {
                                  label: "Block user",
                                  icon: UserX,
                                  destructive: true,
                                  onSelect: () => setBlockOpen(true),
                                },
                              ]
                            : []),
                        ]}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </Container>
        </section>

        <Container className="py-10 lg:py-14">
          {blocked && !own && (
            <div className="mb-6 flex items-center gap-2 rounded-card bg-muted-soft px-4 py-3 text-sm text-muted">
              <UserRoundX aria-hidden className="size-4" />
              You've blocked this user. Manage blocked users in{" "}
              <a href="/settings/privacy" className="font-semibold underline underline-offset-4">
                settings
              </a>
              .
            </div>
          )}

          {!loading &&
            (profile.isVerified ? (
              <TrustCard verifiedOn={profile.verifiedOn} />
            ) : (
              <UnverifiedCard />
            ))}

          <section className="mt-12">
            <SectionHeader title={`Listings by ${profile.name}`} />
            <Tabs
              className="mb-7 max-w-full overflow-x-auto"
              items={[
                { value: "sale", label: `For sale (${groups.sale.length})` },
                { value: "rent", label: `For rent (${groups.rent.length})` },
                { value: "sold", label: `Sold (${groups.sold.length})` },
              ]}
              value={tab}
              onChange={setTab}
            />
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <ListingCardSkeleton key={index} />
                ))}
              </div>
            ) : pageItems.length === 0 ? (
              <p className="rounded-card border bg-surface px-5 py-12 text-center text-sm text-text-secondary">
                {tab === "sale"
                  ? "No cars for sale right now."
                  : tab === "rent"
                    ? "No cars for rent right now."
                    : "Nothing sold yet."}
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pageItems.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-8 flex justify-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
                  <button
                    key={item}
                    aria-current={item === page ? "page" : undefined}
                    onClick={() => setPage(item)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-button text-sm font-semibold text-primary hover:bg-muted-soft",
                      item === page && "bg-primary text-white hover:bg-primary-hover",
                    )}
                  >
                    {item}
                  </button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </nav>
            )}
          </section>
        </Container>
      </main>
      <Footer />

      {reportOpen && (
        <ReportListingModal
          title="Report this user"
          reasons={userReportReasons}
          onClose={() => setReportOpen(false)}
          onSubmitted={() => {
            setReportOpen(false);
            show({ message: "Thanks. Our team will review this profile." });
          }}
        />
      )}
      {blockOpen && (
        <ConfirmDialog
          title={`Block ${profile.name}?`}
          description="They won't be able to message you or see your contact details. They aren't notified."
          confirmLabel="Block user"
          destructive
          onClose={() => setBlockOpen(false)}
          onConfirm={() => {
            block({ id: profile.id, name: profile.name, avatar: profile.avatar });
            setBlockOpen(false);
            show({
              message: `${profile.name} has been blocked`,
              actionLabel: "Manage",
              onAction: () => window.location.assign("/settings/privacy"),
            });
          }}
        />
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse px-5 py-3 text-center">
      <dt className="mt-0.5 text-xs text-text-secondary">{label}</dt>
      <dd className="price text-xl font-bold text-text-primary">{value}</dd>
    </div>
  );
}

function TrustCard({ verifiedOn }: { verifiedOn?: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) =>
      !root.current?.contains(event.target as Node) && setOpen(false);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div className="flex flex-col gap-3 rounded-card bg-success-soft p-5 sm:flex-row sm:items-center">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface text-success">
        <ShieldCheck className="size-6" />
      </span>
      <div className="flex-1">
        <p className="font-semibold text-text-primary">Identity verified by 33-AutoHub</p>
        <p className="mt-0.5 text-sm text-muted">
          ID and address checked on {verifiedOn ? longDate(verifiedOn) : "file"}.
        </p>
      </div>
      <div ref={root} className="relative">
        <button
          aria-expanded={open}
          aria-controls="verified-explainer"
          onClick={() => setOpen(!open)}
          className="text-sm font-semibold text-success underline-offset-4 hover:underline"
        >
          What does verified mean?
        </button>
        {open && (
          <div
            id="verified-explainer"
            role="dialog"
            aria-label="What verified means"
            className="absolute right-0 top-8 z-30 w-72 rounded-card border bg-surface p-4 text-sm shadow-card-hover"
          >
            <ul className="grid gap-2 text-text-primary">
              <li className="flex gap-2">
                <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />A
                government ID was checked by our team.
              </li>
              <li className="flex gap-2">
                <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />A recent
                proof of address matches the name.
              </li>
              <li className="flex gap-2">
                <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
                The phone number was confirmed.
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function UnverifiedCard() {
  return (
    <div
      role="note"
      className="flex gap-3 rounded-card bg-warning-soft p-4 text-sm leading-6 text-warning"
    >
      <ShieldAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
      <p>
        This seller hasn't verified their identity yet. Take extra care before paying anything, and
        keep the conversation on 33-AutoHub.
      </p>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div
      className="flex flex-col gap-6 lg:flex-row lg:justify-between"
      aria-label="Loading profile"
    >
      <div className="flex gap-5">
        <Skeleton className="size-24 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
      </div>
      <Skeleton className="h-16 w-80 max-w-full rounded-card" />
    </div>
  );
}

function SellerNotFound() {
  useEffect(() => {
    document.title = "Seller not found · 33-AutoHub";
  }, []);
  return (
    <>
      <Navbar />
      <main>
        <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-muted-soft text-primary">
            <UserX className="size-7" />
          </span>
          <h1 className="mt-5 text-2xl font-bold leading-8">Seller not found</h1>
          <p className="mt-2 text-text-secondary">This profile may have been removed.</p>
          <LinkButton href="/search" variant="primary" className="mt-6">
            Browse cars
          </LinkButton>
        </Container>
      </main>
      <Footer />
    </>
  );
}
