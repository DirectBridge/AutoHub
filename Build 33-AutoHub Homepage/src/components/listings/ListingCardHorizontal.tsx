import { Calendar, CarFront, Fuel, Gauge, Heart, MapPin, Settings2 } from "lucide-react";
import type { Listing } from "@/data/mockListings";
import { cn, formatNumber, relativeDate } from "@/lib/utils";
import {
  ListingTypeBadge,
  PhotoCount,
  StatusBadge,
  UnverifiedBadge,
  VerifiedBadge,
} from "@/components/common/Badges";
import { Avatar } from "@/components/ui/avatar";
import { LinkButton } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/context/FavoritesContext";

export function ListingCardHorizontal({ listing }: { listing: Listing }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(listing.id);
  const inactive = listing.status !== "active";

  return (
    <article className="group relative flex min-h-40 overflow-hidden rounded-card border bg-surface shadow-card transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card-hover focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 sm:min-h-52">
      <a
        href={`/listing/${listing.id}`}
        className="absolute inset-0 z-10 rounded-card"
        aria-label={`View ${listing.title}`}
      />
      <div className="relative w-30 shrink-0 overflow-hidden bg-muted-soft sm:w-52 lg:w-[17.5rem]">
        <img
          src={listing.images[0]}
          alt={`${listing.title} exterior`}
          className={cn(
            "size-full object-cover transition duration-200 ease-out group-hover:scale-[1.03]",
            inactive && "grayscale",
          )}
        />
        {inactive && <div className="absolute inset-0 bg-primary/55" />}
        <div className="absolute left-2 top-2 z-20 sm:left-3 sm:top-3">
          <ListingTypeBadge type={listing.type} />
        </div>
        <button
          type="button"
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorite}
          onClick={() => toggleFavorite(listing.id)}
          className="absolute right-2 top-2 z-20 hidden size-9 items-center justify-center rounded-full bg-surface text-primary shadow-card hover:text-danger sm:flex"
        >
          <Heart className={cn("size-[1.125rem]", favorite && "fill-danger text-danger")} />
        </button>
        <div className="absolute bottom-2 right-2 z-20 hidden sm:block">
          <PhotoCount count={listing.images.length} />
        </div>
        {inactive && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <StatusBadge status={listing.status as "sold" | "rented"} />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 gap-5 p-3 sm:p-5">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold leading-6 text-text-primary sm:text-xl sm:leading-7">
            {listing.title}
          </h3>
          <div className="mt-2 flex items-baseline gap-1 lg:hidden">
            <Price listing={listing} compact />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-secondary sm:text-sm">
            <Spec icon={Calendar} text={String(listing.year)} />
            <Spec icon={Gauge} text={`${formatNumber(listing.mileage)} km`} />
            <span className="hidden sm:flex">
              <Spec icon={Fuel} text={capitalize(listing.fuelType)} />
            </span>
            <span className="hidden sm:flex">
              <Spec icon={Settings2} text={capitalize(listing.transmission)} />
            </span>
            <span className="hidden xl:flex">
              <Spec icon={CarFront} text={capitalize(listing.bodyType)} />
            </span>
          </div>
          <p className="mt-4 hidden max-w-xl text-sm leading-6 text-text-secondary sm:line-clamp-2">
            Carefully presented {listing.make} {listing.model} with a complete structured listing,
            clear vehicle details and direct in-platform contact with the seller.
          </p>
          <div className="mt-4 hidden items-center gap-4 text-xs text-text-secondary sm:flex">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {listing.location}
            </span>
            <span>{relativeDate(listing.createdAt)}</span>
          </div>
        </div>

        <div className="hidden w-48 shrink-0 flex-col items-end border-l pl-5 lg:flex">
          <Price listing={listing} />
          <div className="mt-5 flex max-w-full items-center gap-2 text-xs font-medium text-primary">
            <a
              href={`/seller/${listing.seller.id}`}
              className="relative z-20 flex min-w-0 items-center gap-2 hover:text-accent hover:underline"
            >
              <Avatar
                src={listing.seller.avatar}
                name={listing.seller.name}
                size="sm"
                className="size-6"
              />
              <span className="truncate">{listing.seller.name}</span>
            </a>
            {listing.seller.isVerified ? <VerifiedBadge compact /> : <UnverifiedBadge compact />}
          </div>
          <div className="relative z-20 mt-auto grid w-full gap-2">
            <LinkButton
              href={`/listing/${listing.id}?contact=1`}
              variant="accent"
              className="h-8 px-3"
            >
              Contact seller
            </LinkButton>
            <LinkButton href={`/listing/${listing.id}`} variant="secondary" className="h-8 px-3">
              View details
            </LinkButton>
          </div>
        </div>
      </div>
    </article>
  );
}

function Price({ listing, compact = false }: { listing: Listing; compact?: boolean }) {
  return (
    <div className="text-right">
      <span
        className={cn("price font-bold text-primary", compact ? "text-lg" : "text-xl leading-7")}
      >
        {formatNumber(listing.type === "rent" ? listing.rentalPrice.daily : listing.price)} DA
      </span>
      {listing.type === "rent" && (
        <span className="ml-1 text-xs font-normal text-text-secondary">/ day</span>
      )}
    </div>
  );
}

function Spec({ icon: Icon, text }: { icon: typeof Calendar; text: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon className="size-4 shrink-0 text-secondary" strokeWidth={1.75} />
      <span className="truncate">{text}</span>
    </span>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function ListingCardHorizontalSkeleton() {
  return (
    <div
      className="flex min-h-40 overflow-hidden rounded-card border bg-surface shadow-card sm:min-h-52"
      aria-label="Loading listing"
    >
      <Skeleton className="w-30 shrink-0 rounded-none sm:w-52 lg:w-[17.5rem]" />
      <div className="flex flex-1 gap-5 p-4 sm:p-5">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="hidden h-12 w-full sm:block" />
          <Skeleton className="hidden h-4 w-1/2 sm:block" />
        </div>
        <div className="hidden w-48 space-y-4 border-l pl-5 lg:block">
          <Skeleton className="ml-auto h-7 w-4/5" />
          <Skeleton className="ml-auto h-6 w-full" />
          <Skeleton className="mt-8 h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  );
}
