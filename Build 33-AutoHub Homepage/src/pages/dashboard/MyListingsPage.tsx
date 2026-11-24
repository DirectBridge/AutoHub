import { useEffect, useMemo, useState } from "react";
import {
  CarFront,
  CheckCircle2,
  ExternalLink,
  Eye,
  Heart,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { DashboardLayout, isSellerRole } from "@/components/dashboard/DashboardLayout";
import { ActionMenu } from "@/components/dashboard/ActionMenu";
import { EmptyState, useSimulatedLoading } from "@/components/dashboard/DashboardWidgets";
import { ListingTypeBadge, StatusBadge } from "@/components/common/Badges";
import { Button, LinkButton } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useGlobalToast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";
import { useListings } from "@/context/ListingsContext";
import type { Listing, ListingStatus } from "@/data/mockListings";
import { cn, formatNumber, relativeDate } from "@/lib/utils";

type Tab = "active" | "closed" | "all";
type Sort = "newest" | "views" | "inquiries" | "price";
const perPage = 10;

const priceOf = (listing: Listing) =>
  listing.type === "rent" ? listing.rentalPrice.daily : listing.price;
const closedLabel = (listing: Listing): ListingStatus =>
  listing.type === "rent" ? "rented" : "sold";

export function MyListingsPage() {
  const { user } = useAuth();
  const { listings, setStatus, deleteListing, restore } = useListings();
  const { show } = useGlobalToast();
  const loading = useSimulatedLoading();
  const [tab, setTab] = useState<Tab>("active");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ kind: "status" | "delete"; listing: Listing } | null>(
    null,
  );
  const seller = isSellerRole(user?.role);

  useEffect(() => {
    if (user && !seller) window.location.replace("/dashboard");
  }, [user, seller]);
  useEffect(() => setPage(1), [tab, query, sort]);

  const owned = listings.filter((item) => item.seller.id === user?.id);
  const counts = {
    active: owned.filter((item) => item.status === "active").length,
    closed: owned.filter((item) => item.status !== "active").length,
    all: owned.length,
  };
  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return owned
      .filter((item) =>
        tab === "all"
          ? true
          : tab === "active"
            ? item.status === "active"
            : item.status !== "active",
      )
      .filter((item) => !term || item.title.toLowerCase().includes(term))
      .sort((a, b) => {
        if (sort === "views") return b.views - a.views;
        if (sort === "inquiries") return b.inquiries - a.inquiries;
        if (sort === "price") return priceOf(b) - priceOf(a);
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [owned, tab, query, sort]);
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const pageRows = rows.slice((page - 1) * perPage, page * perPage);

  if (!user || !seller) return null;

  const markActive = (listing: Listing) => {
    const previous = listing.status;
    setStatus(listing.id, "active");
    show({
      message: "Listing marked as active.",
      actionLabel: "Undo",
      onAction: () => setStatus(listing.id, previous),
    });
  };

  const menuFor = (listing: Listing) => [
    { label: "View listing", icon: ExternalLink, href: `/listing/${listing.id}` },
    { label: "Edit", icon: Pencil, href: `/listing/${listing.id}/edit` },
    listing.status === "active"
      ? {
          label: `Mark as ${closedLabel(listing)}`,
          icon: CheckCircle2,
          onSelect: () => setConfirm({ kind: "status", listing }),
        }
      : { label: "Mark as active", icon: CheckCircle2, onSelect: () => markActive(listing) },
    {
      label: "Delete",
      icon: Trash2,
      destructive: true,
      onSelect: () => setConfirm({ kind: "delete", listing }),
    },
  ];

  const open = (listing: Listing) => window.location.assign(`/listing/${listing.id}`);
  const emptyText =
    counts.all === 0
      ? { title: "No listings yet", text: "Post your first car in a few minutes." }
      : tab === "closed"
        ? {
            title: "Nothing sold yet",
            text: "Listings you mark as sold or rented will appear here.",
          }
        : query
          ? { title: "No matching listings", text: "Try a different search term." }
          : { title: "No listings yet", text: "Post your first car in a few minutes." };

  return (
    <DashboardLayout
      docTitle="My listings"
      title="My listings"
      subtitle={`${counts.all} listings · ${counts.active} active`}
      actions={
        <LinkButton href="/sell" variant="accent">
          <Plus className="size-4" />
          Post a listing
        </LinkButton>
      }
    >
      {!user.isVerified && (
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-card bg-warning-soft px-4 py-3 text-sm text-warning">
          <ShieldAlert className="size-4 shrink-0" />
          Your listings show an 'Unverified' label.
          <a href="/verification" className="font-semibold underline underline-offset-4">
            Get verified →
          </a>
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          className="w-full overflow-x-auto sm:w-auto"
          items={[
            { value: "active", label: `Active (${counts.active})` },
            { value: "closed", label: `Sold & rented (${counts.closed})` },
            { value: "all", label: `All (${counts.all})` },
          ]}
          value={tab}
          onChange={setTab}
        />
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:w-[26rem]">
          <Input
            label="Search your listings"
            hideLabel
            type="search"
            placeholder="Search your listings"
            icon={<Search className="size-4" />}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Select
            label="Sort listings"
            hideLabel
            value={sort}
            onChange={(event) => setSort(event.target.value as Sort)}
            className="w-40"
          >
            <option value="newest">Newest</option>
            <option value="views">Most viewed</option>
            <option value="inquiries">Most inquiries</option>
            <option value="price">Price</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : pageRows.length === 0 ? (
        <EmptyState
          icon={CarFront}
          title={emptyText.title}
          text={emptyText.text}
          action={
            emptyText.title === "No listings yet" && (
              <LinkButton href="/sell" variant="accent">
                <Plus className="size-4" />
                Post a listing
              </LinkButton>
            )
          }
        />
      ) : (
        <>
          <div className="hidden rounded-card border bg-surface shadow-card lg:block">
            <table className="w-full text-sm">
              <caption className="sr-only">Your listings</caption>
              <thead>
                <tr className="border-b text-left text-xs text-text-secondary">
                  {["Listing", "Price", "Status", "Views", "Inquiries", "Saves", "Posted"].map(
                    (label) => (
                      <th
                        key={label}
                        scope="col"
                        className={cn(
                          "px-4 py-3 font-medium",
                          ["Views", "Inquiries", "Saves"].includes(label) && "text-right",
                        )}
                      >
                        {label}
                      </th>
                    ),
                  )}
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pageRows.map((listing) => (
                  <tr
                    key={listing.id}
                    onClick={() => open(listing)}
                    className="cursor-pointer hover:bg-background"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={listing.images[0]}
                          alt=""
                          className={cn(
                            "h-12 w-16 shrink-0 rounded-button object-cover",
                            listing.status !== "active" && "grayscale",
                          )}
                        />
                        <div className="min-w-0">
                          <a
                            href={`/listing/${listing.id}`}
                            onClick={(event) => event.stopPropagation()}
                            className="block max-w-56 truncate font-semibold text-text-primary hover:text-accent"
                          >
                            {listing.title}
                          </a>
                          <div className="mt-1">
                            <ListingTypeBadge type={listing.type} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="price whitespace-nowrap px-4 py-3 font-semibold text-primary">
                      {formatNumber(priceOf(listing))} DA
                      {listing.type === "rent" && (
                        <span className="text-xs font-normal text-text-secondary"> / day</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ListingStatusBadge status={listing.status} />
                    </td>
                    <td className="price px-4 py-3 text-right">{formatNumber(listing.views)}</td>
                    <td className="price px-4 py-3 text-right">{listing.inquiries}</td>
                    <td className="price px-4 py-3 text-right">{listing.saves}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                      {relativeDate(listing.createdAt)}
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <ActionMenu label={`Actions for ${listing.title}`} items={menuFor(listing)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="grid gap-3 lg:hidden">
            {pageRows.map((listing) => (
              <li
                key={listing.id}
                className="flex gap-3 rounded-card border bg-surface p-3 shadow-card"
              >
                <img
                  src={listing.images[0]}
                  alt=""
                  className={cn(
                    "h-20 w-24 shrink-0 rounded-button object-cover",
                    listing.status !== "active" && "grayscale",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={`/listing/${listing.id}`}
                      className="truncate text-sm font-semibold text-text-primary"
                    >
                      {listing.title}
                    </a>
                    <ActionMenu label={`Actions for ${listing.title}`} items={menuFor(listing)} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="price text-sm font-bold text-primary">
                      {formatNumber(priceOf(listing))} DA{listing.type === "rent" && " / day"}
                    </span>
                    <ListingStatusBadge status={listing.status} />
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Eye aria-hidden className="size-3.5" />
                      {formatNumber(listing.views)}
                      <span className="sr-only"> views</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare aria-hidden className="size-3.5" />
                      {listing.inquiries}
                      <span className="sr-only"> inquiries</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart aria-hidden className="size-3.5" />
                      {listing.saves}
                      <span className="sr-only"> saves</span>
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-1">
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
        </>
      )}

      {confirm?.kind === "status" && (
        <ConfirmDialog
          title={`Mark as ${closedLabel(confirm.listing)}?`}
          description={`Buyers will see this listing as ${closedLabel(confirm.listing)} and won't be able to contact you about it.`}
          confirmLabel={`Mark as ${closedLabel(confirm.listing)}`}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            const { listing } = confirm;
            setConfirm(null);
            setStatus(listing.id, closedLabel(listing));
            show({
              message: `Listing marked as ${closedLabel(listing)}.`,
              actionLabel: "Undo",
              onAction: () => setStatus(listing.id, "active"),
            });
          }}
        />
      )}
      {confirm?.kind === "delete" && (
        <ConfirmDialog
          title="Delete this listing? This can't be undone."
          description="The listing, its photos and its statistics will be permanently removed."
          confirmLabel="Delete"
          destructive
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            const { listing } = confirm;
            setConfirm(null);
            deleteListing(listing.id);
            show({
              message: "Listing deleted.",
              actionLabel: "Undo",
              onAction: () => restore(listing.id),
            });
          }}
        />
      )}
    </DashboardLayout>
  );
}

function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return status === "active" ? (
    <span className="inline-flex items-center rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
      Active
    </span>
  ) : (
    <StatusBadge status={status} />
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-card border bg-surface p-4 shadow-card" aria-label="Loading listings">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-4 border-b py-3 last:border-0">
          <Skeleton className="h-12 w-16 rounded-button" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="hidden h-4 w-24 sm:block" />
          <Skeleton className="hidden h-4 w-16 md:block" />
          <Skeleton className="size-8" />
        </div>
      ))}
    </div>
  );
}
