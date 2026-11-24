import type { Listing } from "@/data/mockListings";
import { ListingCard } from "./ListingCard";

export function ListingGrid({ listings }: { listings: Listing[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
