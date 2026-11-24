import { useMemo, useState } from "react";
import {
  Bookmark,
  Camera,
  Car,
  CheckCircle2,
  Eye,
  Heart,
  MessageSquare,
  Pencil,
  X,
} from "lucide-react";
import { DashboardLayout, isSellerRole } from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardHeader,
  NewBadgeCount,
  RecentMessages,
  StatCard,
  StatCardSkeleton,
  useSimulatedLoading,
  ViewAllLink,
} from "@/components/dashboard/DashboardWidgets";
import {
  VerificationStatusCard,
  type VerificationState,
} from "@/components/dashboard/VerificationStatusCard";
import { ViewsChart } from "@/components/dashboard/ViewsChart";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/ListingCard";
import { LinkButton } from "@/components/ui/button";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useListings } from "@/context/ListingsContext";
import { useSavedSearches } from "@/context/SavedSearchesContext";
import { conversationsFor, viewsHistory } from "@/data/dashboardMock";
import { formatNumber } from "@/lib/utils";
import { searchChips } from "@/utils/describeSearch";

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

export function OverviewPage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <DashboardLayout
      docTitle="Overview"
      title={`${greeting()}, ${user.firstName}`}
      subtitle="Here's what's happening with your account."
    >
      {isSellerRole(user.role) ? <SellerOverview user={user} /> : <BuyerOverview user={user} />}
    </DashboardLayout>
  );
}

function SellerOverview({ user }: { user: AuthUser }) {
  const loading = useSimulatedLoading();
  const { listings } = useListings();
  const [verification, setVerification] = useState<VerificationState>(
    user.verificationStatus === "verified"
      ? "approved"
      : user.verificationStatus === "unverified"
        ? "none"
        : user.verificationStatus,
  );
  const owned = listings.filter((item) => item.seller.id === user.id);
  const history = useMemo(() => viewsHistory(user.id), [user.id]);
  const unread = conversationsFor(user.role).filter((item) => item.unread).length;
  const top = [...owned].sort((a, b) => b.views - a.views).slice(0, 3);
  const stats = [
    {
      icon: Car,
      label: "Active listings",
      value: owned.filter((item) => item.status === "active").length,
      trend: 12,
    },
    {
      icon: Eye,
      label: "Views (30 days)",
      value: history.reduce((sum, point) => sum + point.views, 0),
      trend: 18,
    },
    {
      icon: MessageSquare,
      label: "Inquiries (30 days)",
      value: owned.reduce((sum, item) => sum + item.inquiries, 0),
      trend: -4,
    },
    {
      icon: Heart,
      label: "Saves",
      value: owned.reduce((sum, item) => sum + item.saves, 0),
      trend: 9,
    },
  ];

  return (
    <div className="grid gap-6">
      <div>
        <VerificationStatusCard state={verification} userId={user.id} />
        <label className="mt-2 inline-flex items-center gap-2 rounded-button border border-dashed px-2.5 py-1 text-xs text-text-secondary">
          Dev: preview state
          <select
            value={verification}
            onChange={(event) => setVerification(event.target.value as VerificationState)}
            className="bg-transparent font-medium text-primary focus:outline-none"
          >
            <option value="none">None</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((stat) =>
          loading ? (
            <StatCardSkeleton key={stat.label} />
          ) : (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={formatNumber(stat.value)}
              trend={stat.trend}
            />
          ),
        )}
      </div>

      <ViewsChart history={history} topListings={top} loading={loading} />

      <div className="grid gap-6 xl:grid-cols-2">
        <RecentMessages role={user.role} loading={loading} />
        <NeedsAttention userId={user.id} unread={unread} />
      </div>
    </div>
  );
}

function NeedsAttention({ userId, unread }: { userId: string; unread: number }) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const items = [
    ...(userId === "s1"
      ? [
          {
            id: "photos",
            icon: Camera,
            text: "2 listings have fewer than 3 photos",
            action: "Add photos",
            href: "/listing/car-10/edit",
          },
          {
            id: "stale",
            icon: Pencil,
            text: "Golf 8 listed 45 days ago with no inquiries. Consider updating the price.",
            action: "Edit",
            href: "/listing/car-1/edit",
          },
        ]
      : []),
    ...(unread
      ? [
          {
            id: "unread",
            icon: MessageSquare,
            text: `Answer ${unread} unread messages`,
            action: "Open",
            href: "/messages",
          },
        ]
      : []),
  ].filter((item) => !dismissed.includes(item.id));

  return (
    <Card>
      <CardHeader title="Needs attention" />
      {items.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <CheckCircle2 className="mx-auto size-10 text-success" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-text-primary">All caught up</p>
          <p className="mt-1 text-sm text-text-secondary">
            Nothing needs your attention right now.
          </p>
        </div>
      ) : (
        <ul className="divide-y">
          {items.map(({ id, icon: Icon, text, action, href }) => (
            <li key={id} className="flex items-center gap-3 px-5 py-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning">
                <Icon className="size-4" />
              </span>
              <p className="min-w-0 flex-1 text-sm text-text-primary">{text}</p>
              <LinkButton href={href} variant="secondary" className="h-8 shrink-0 px-3">
                {action}
              </LinkButton>
              <button
                aria-label={`Dismiss: ${text}`}
                onClick={() => setDismissed((current) => [...current, id])}
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-secondary hover:bg-muted-soft"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function BuyerOverview({ user }: { user: AuthUser }) {
  const loading = useSimulatedLoading();
  const { favorites } = useFavorites();
  const { searches } = useSavedSearches();
  const { getListing } = useListings();
  const unread = conversationsFor(user.role).filter((item) => item.unread).length;
  const recent = [...favorites]
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .map((entry) => getListing(entry.id))
    .filter((item) => item !== undefined)
    .slice(0, 4);

  return (
    <div className="grid gap-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {loading ? (
          [0, 1, 2].map((index) => <StatCardSkeleton key={index} />)
        ) : (
          <>
            <StatCard icon={Heart} label="Favorites" value={String(favorites.length)} />
            <StatCard icon={Bookmark} label="Saved searches" value={String(searches.length)} />
            <StatCard icon={MessageSquare} label="Unread messages" value={String(unread)} />
          </>
        )}
      </div>

      {searches.length > 0 && (
        <section aria-labelledby="saved-strip">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="saved-strip" className="text-xl font-semibold leading-7">
              Saved searches
            </h2>
            <ViewAllLink href="/dashboard/searches">Manage</ViewAllLink>
          </div>
          <div className="horizontal-scroll -mx-4 flex gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 xl:grid-cols-3">
            {searches.slice(0, 3).map((search) => (
              <div
                key={search.id}
                className="w-72 shrink-0 rounded-card border bg-surface p-4 shadow-card sm:w-auto"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-text-primary">{search.name}</p>
                  {search.newMatches > 0 && <NewBadgeCount count={search.newMatches} />}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {searchChips(search.params)
                    .slice(0, 3)
                    .map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full bg-muted-soft px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        {chip}
                      </span>
                    ))}
                </div>
                <a
                  href={`/search?${search.params}`}
                  className="mt-4 inline-block text-sm font-semibold text-accent hover:text-accent-hover hover:underline"
                >
                  View results
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="Your favorites" link="/dashboard/favorites" />
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((index) => (
              <ListingCardSkeleton key={index} />
            ))}
          </div>
        ) : recent.length ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {recent.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Tap the heart on any car to save it here.</p>
        )}
      </section>

      <RecentMessages role={user.role} loading={loading} />

      <div className="flex flex-col gap-2 rounded-card bg-accent-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-primary">Thinking of selling your car?</p>
        <a href="/settings/account" className="text-sm font-semibold text-accent-hover hover:underline">
          Start selling →
        </a>
      </div>
    </div>
  );
}
