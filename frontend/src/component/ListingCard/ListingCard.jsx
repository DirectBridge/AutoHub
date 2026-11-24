import { useState } from 'react';
import { Calendar, Fuel, Gauge, Heart, MapPin, Settings2 } from 'lucide-react';
import { cn, formatNumber, relativeDate } from '../../lib/utils';
import { ListingTypeBadge, PhotoCount, StatusBadge, UnverifiedBadge, VerifiedBadge } from '../Badges/Badges';
import { Skeleton } from '../Skeleton/Skeleton';
import { Avatar } from '../Avatar/Avatar';
import { useFavorites } from '../../context/FavoritesContext';

export function ListingCard({ listing, initialFavorite, forceHover = false }) {
  const favorites = useFavorites();
  const [demoFavorite, setDemoFavorite] = useState(Boolean(initialFavorite));
  const showcase = initialFavorite !== undefined;
  const favorite = showcase ? demoFavorite : favorites.isFavorite(listing.id);
  const inactive = listing.status !== 'active';

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-card border bg-surface shadow-card transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card-hover focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2',
        forceHover && '-translate-y-0.5 shadow-card-hover',
      )}
    >
      <a href={`/listings/${listing.id}`} className="absolute inset-0 z-10 rounded-card" aria-label={`View ${listing.title}`} />
      <div className="relative aspect-video overflow-hidden bg-muted-soft">
        <img
          src={listing.images[0]}
          alt={`${listing.title} exterior`}
          className={cn(
            'size-full object-cover transition duration-200 ease-out group-hover:scale-[1.03]',
            forceHover && 'scale-[1.03]',
            inactive && 'grayscale',
          )}
        />
        {inactive && <div className="absolute inset-0 bg-primary/55" />}
        <div className="absolute left-3 top-3 z-20"><ListingTypeBadge type={listing.type} /></div>
        <button
          type="button"
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={favorite}
          onClick={() => showcase ? setDemoFavorite(!demoFavorite) : favorites.toggleFavorite(listing.id)}
          className="absolute right-3 top-3 z-20 flex size-9 items-center justify-center rounded-full bg-surface text-primary shadow-card hover:scale-105 hover:text-danger focus-visible:outline-2"
        >
          <Heart className={cn('size-[1.125rem]', favorite && 'fill-danger text-danger')} />
        </button>
        <div className="absolute bottom-3 right-3 z-20"><PhotoCount count={listing.images.length} /></div>
        {inactive && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <StatusBadge status={listing.status} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="truncate text-base font-semibold leading-6 text-text-primary">{listing.title}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <p className="price text-xl font-bold leading-7 text-primary">
            {listing.type === 'sale' ? `${formatNumber(listing.price)} DA` : `${formatNumber(listing.rentalPrice.daily)} DA`}
          </p>
          {listing.type === 'rent' && <span className="text-sm text-text-secondary">/ day</span>}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-text-secondary">
          <Spec icon={Calendar} text={String(listing.year)} />
          <Spec icon={Gauge} text={`${formatNumber(listing.mileage)} km`} />
          <Spec icon={Fuel} text={capitalize(listing.fuelType)} />
          <Spec icon={Settings2} text={capitalize(listing.transmission)} />
        </div>
        <div className="my-4 border-t" />
        <div className="flex items-center justify-between gap-3 text-xs text-text-secondary">
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin className="size-4 shrink-0" />
            <span className="truncate">{listing.location}</span>
          </span>
          <span className="shrink-0">{relativeDate(listing.createdAt)}</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-text-primary">
          <a
            href={`/seller/${listing.seller.id}`}
            className="relative z-20 flex min-w-0 items-center gap-2 hover:text-accent hover:underline"
          >
            <Avatar src={listing.seller.avatar} name={listing.seller.name} size="sm" className="size-6" />
            <span className="truncate">{listing.seller.name}</span>
          </a>
          {listing.seller.isVerified ? <VerifiedBadge compact /> : <UnverifiedBadge compact />}
        </div>
      </div>
    </article>
  );
}

function Spec({ icon: Icon, text }) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon aria-hidden className="size-4 shrink-0 text-secondary" strokeWidth={1.75} />
      <span className="truncate">{text}</span>
    </span>
  );
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border bg-surface shadow-card" aria-label="Loading listing">
      <Skeleton className="aspect-video rounded-none" />
      <div className="space-y-4 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-7 w-1/2" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-4" /><Skeleton className="h-4" />
          <Skeleton className="h-4" /><Skeleton className="h-4" />
        </div>
        <div className="border-t pt-4"><Skeleton className="h-4 w-full" /></div>
        <Skeleton className="h-6 w-2/3" />
      </div>
    </div>
  );
}

