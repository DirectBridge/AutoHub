import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmptyState, useSimulatedLoading } from "@/components/dashboard/DashboardWidgets";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/ListingCard";
import { LinkButton } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { useFavorites, type FavoriteEntry } from "@/context/FavoritesContext";
import { useListings } from "@/context/ListingsContext";
import type { Listing } from "@/data/mockListings";
import { cn } from "@/lib/utils";

type Sort = "recent" | "price_asc" | "price_desc";
type Filter = "all" | "sale" | "rent";
const priceOf = (listing: Listing) =>
  listing.type === "rent" ? listing.rentalPrice.daily : listing.price;

export function FavoritesPage() {
  const { favorites } = useFavorites();
  const { getListing } = useListings();
  const loading = useSimulatedLoading();
  const [sort, setSort] = useState<Sort>("recent");
  const [filter, setFilter] = useState<Filter>("all");
  // Keep just-removed entries briefly so their cards can fade out.
  const [fading, setFading] = useState<FavoriteEntry[]>([]);
  const previous = useRef(favorites);

  useEffect(() => {
    const removed = previous.current.filter(
      (entry) => !favorites.some((item) => item.id === entry.id),
    );
    previous.current = favorites;
    if (!removed.length) return;
    setFading((current) => [...current, ...removed]);
    window.setTimeout(
      () =>
        setFading((current) =>
          current.filter((entry) => !removed.some((item) => item.id === entry.id)),
        ),
      200,
    );
  }, [favorites]);

  const entries = [
    ...favorites,
    ...fading.filter((entry) => !favorites.some((item) => item.id === entry.id)),
  ];
  const items = entries
    .map((entry) => ({ entry, listing: getListing(entry.id) }))
    .filter((item): item is { entry: FavoriteEntry; listing: Listing } => Boolean(item.listing))
    .filter(({ listing }) => filter === "all" || listing.type === filter)
    .sort((a, b) => {
      if (sort === "price_asc") return priceOf(a.listing) - priceOf(b.listing);
      if (sort === "price_desc") return priceOf(b.listing) - priceOf(a.listing);
      return b.entry.savedAt.localeCompare(a.entry.savedAt);
    });
  const count = favorites.length;

  return (
    <DashboardLayout
      docTitle="Favorites"
      title="Favorites"
      subtitle={`${count} saved ${count === 1 ? "car" : "cars"}`}
    >
      {count === 0 && fading.length === 0 && !loading ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          text="Tap the heart on any car to save it here."
          action={
            <LinkButton href="/search" variant="primary">
              Browse cars
            </LinkButton>
          }
        />
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              items={[
                { value: "all", label: "All" },
                { value: "sale", label: "For sale" },
                { value: "rent", label: "For rent" },
              ]}
              value={filter}
              onChange={setFilter}
            />
            <Select
              label="Sort favorites"
              hideLabel
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
              className="sm:w-52"
            >
              <option value="recent">Recently saved</option>
              <option value="price_asc">Price low → high</option>
              <option value="price_desc">Price high → low</option>
            </Select>
          </div>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <ListingCardSkeleton key={index} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="rounded-card border bg-surface px-5 py-10 text-center text-sm text-text-secondary">
              No {filter === "sale" ? "cars for sale" : "rentals"} in your favorites.
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {items.map(({ listing }) => {
                const leaving = !favorites.some((item) => item.id === listing.id);
                return (
                  <li
                    key={listing.id}
                    className={cn("transition-opacity duration-200", leaving && "opacity-0")}
                  >
                    <ListingCard listing={listing} />
                    {listing.status !== "active" && (
                      <p className="mt-2 text-sm text-text-secondary">
                        No longer available ·{" "}
                        <a
                          href={`/search?type=${listing.type}&make=${encodeURIComponent(listing.make)}&body=${listing.bodyType}`}
                          className="font-semibold text-accent hover:text-accent-hover hover:underline"
                        >
                          Find similar →
                        </a>
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
