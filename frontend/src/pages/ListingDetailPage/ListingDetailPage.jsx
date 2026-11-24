import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, Calendar, Check, ChevronLeft, ChevronRight, Clock,
  Eye, Flag, Fuel, Gauge, Heart, MapPin, MessageSquare, Settings2, ShieldAlert, ShieldCheck,
} from 'lucide-react';
import { Navbar } from '../../component/Navbar/Navbar';
import { Footer } from '../../component/Footer/Footer';
import { Container } from '../../component/Container/Container';
import { Button, LinkButton } from '../../component/Button/Button';
import { Tabs } from '../../component/Tabs/Tabs';
import { Avatar } from '../../component/Avatar/Avatar';
import { Skeleton } from '../../component/Skeleton/Skeleton';
import { ListingTypeBadge, NewBadge, StatusBadge, UnverifiedBadge, VerifiedBadge } from '../../component/Badges/Badges';
import { SectionHeader } from '../../component/SectionHeader/SectionHeader';
import { ListingCard } from '../../component/ListingCard/ListingCard';
import { mockListings } from '../../data/mockListings';
import { cn, formatNumber, relativeDate } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useListings } from '../../context/ListingsContext';
import { useFavorites } from '../../context/FavoritesContext';
import './ListingDetailPage.css';

const periodLabel = { daily: 'day', weekly: 'week', monthly: 'month' };

export function ListingDetailPage({ id }) {
  const { getListing, setStatus: setListingStatus, deleteListing } = useListings();
  const favorites = useFavorites();
  const listing = getListing(id);
  const { user } = useAuth();
  const loggedIn = Boolean(user);
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    document.title = `${listing ? fullTitle(listing) : 'Listing not found'} · 33-AutoHub`;
    const timer = window.setTimeout(() => setLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!listing) return <NotFound />;

  const isOwner = user?.id === listing.seller.id;
  const status = listing.status;
  const setStatus = (next) => setListingStatus(listing.id, next);
  const saved = favorites.isFavorite(listing.id);
  const inactive = status !== 'active';
  const closedLabel = listing.type === 'rent' ? 'rented' : 'sold';
  const typePath = listing.type === 'rent' ? 'Rent' : 'Buy';
  const lastSearch = sessionStorage.getItem('autohub:lastSearch');
  const backToSearch = lastSearch || `/search?type=${listing.type}`;

  const toggleSave = () => {
    favorites.toggleFavorite(listing.id);
    if (user) setAnnouncement(saved ? 'Removed from saved listings' : 'Listing saved');
  };

  return (
    <>
      <Navbar />
      <main className="pb-28 lg:pb-0">
        <Container className="py-6 lg:py-8">
          <div className="flex items-center justify-between gap-4">
            <nav aria-label="Breadcrumb" className="min-w-0 truncate text-sm text-text-secondary">
              <a href="/" className="hover:text-accent">Home</a>
              <span className="mx-2">/</span>
              <a href={backToSearch} className="hover:text-accent">{typePath}</a>
              <span className="mx-2">/</span>
              <a href={`/search?type=${listing.type}&make=${encodeURIComponent(listing.make)}`} className="hover:text-accent">{listing.make}</a>
              <span className="mx-2">/</span>
              <span aria-current="page" className="font-medium text-primary">{listing.model}</span>
            </nav>
            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" size="icon" aria-label="Report listing" onClick={() => alert('Report submitted')}>
                <Flag className="size-5" />
              </Button>
            </div>
          </div>

          {inactive && (
            <div className="mt-5 flex flex-col gap-3 rounded-card bg-muted-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold text-muted">This car has been {status}</p>
              <Button variant="secondary" size="sm" onClick={() => document.getElementById('similar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                See similar cars
              </Button>
            </div>
          )}

          <p aria-live="polite" className="sr-only">{announcement}</p>

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
                      {Date.now() - new Date(listing.createdAt).getTime() < 48 * 3600000 && <NewBadge />}
                      {inactive && <StatusBadge status={status} />}
                    </div>
                    <PriceBlock listing={listing} inactive={inactive} />
                    <h1 className="mt-3 text-2xl font-bold leading-8 text-text-primary lg:text-[1.75rem] lg:leading-9">
                      {fullTitle(listing)}
                    </h1>
                    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
                      <span className="flex items-center gap-1.5"><MapPin className="size-4 text-secondary" />{listing.location}</span>
                      <span aria-hidden>·</span>
                      <span className="flex items-center gap-1.5"><Clock className="size-4 text-secondary" />Posted {relativeDate(listing.createdAt).toLowerCase()}</span>
                      <span aria-hidden>·</span>
                      <span className="flex items-center gap-1.5"><Eye className="size-4 text-secondary" />{formatNumber(listing.views)} views</span>
                    </p>
                  </div>

                  <KeySpecs listing={listing} />

                  {!isOwner && (
                    <div className="hidden gap-3 lg:grid">
                      <Button variant="accent" size="lg" disabled={inactive} onClick={() => setContactOpen(true)} className="w-full">
                        <MessageSquare className="size-5" /> Contact seller
                      </Button>
                      <Button variant="secondary" size="lg" aria-pressed={saved} onClick={toggleSave}>
                        <Heart className={cn('size-5', saved && 'fill-danger text-danger')} />
                        {saved ? 'Saved' : 'Save listing'}
                      </Button>
                    </div>
                  )}

                  {listing.rentalConditions && <RentalConditions listing={listing} />}

                  <div className="order-1 lg:order-none lg:border-t lg:pt-6">
                    <SellerCard listing={listing} />
                    {!listing.seller.isVerified && !isOwner && (
                      <div role="note" className="mt-4 flex gap-3 rounded-card bg-warning-soft p-4 text-sm leading-6 text-warning">
                        <ShieldAlert className="mt-0.5 size-5 shrink-0" />
                        <p>This seller hasn&apos;t verified their identity yet. Take extra care before paying anything.</p>
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
                <SafetyTips />
              </div>
            </div>
          )}
        </Container>

        <SimilarCars listing={listing} />
      </main>
      <Footer />

      {/* Mobile action bar */}
      {!loading && !isOwner && (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t bg-surface p-4 lg:hidden">
          <div className="flex gap-3">
            <Button variant="secondary" size="lg" aria-pressed={saved} onClick={toggleSave} className="flex-1">
              <Heart className={cn('size-5', saved && 'fill-danger text-danger')} />
              {saved ? 'Saved' : 'Save'}
            </Button>
            <Button variant="accent" size="lg" disabled={inactive} onClick={() => setContactOpen(true)} className="flex-1">
              <MessageSquare className="size-5" /> Contact seller
            </Button>
          </div>
        </div>
      )}

      {/* Simple contact modal */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4" onClick={() => setContactOpen(false)}>
          <div className="w-full max-w-md rounded-modal bg-surface p-6 shadow-float" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold">Contact {listing.seller.name}</h2>
            <p className="mt-2 text-sm text-text-secondary">Send a message to the seller about this listing.</p>
            <textarea className="mt-4 h-28 w-full rounded-button border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" placeholder="Hi, I'm interested in this car..." />
            <div className="mt-4 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setContactOpen(false)}>Cancel</Button>
              <Button variant="accent" className="flex-1" onClick={() => { alert('Message sent!'); setContactOpen(false); }}>Send message</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function fullTitle(listing) {
  return listing.trim ? `${listing.title} ${listing.trim}` : listing.title;
}

function ListingGallery({ listing, inactive }) {
  const [index, setIndex] = useState(0);
  const images = listing.images;
  return (
    <div className="grid gap-2">
      <div className="relative aspect-video overflow-hidden rounded-card bg-muted-soft">
        <img src={images[index]} alt={listing.title} className={cn('size-full object-cover', inactive && 'grayscale')} />
        {images.length > 1 && (
          <>
            <button onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-surface/80 text-primary shadow-card hover:bg-surface">
              <ChevronLeft className="size-5" />
            </button>
            <button onClick={() => setIndex((i) => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-surface/80 text-primary shadow-card hover:bg-surface">
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-primary/80 px-2 py-1 text-xs font-medium text-white">
          {index + 1}/{images.length}
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.slice(0, 6).map((src, i) => (
          <button key={i} onClick={() => setIndex(i)} className={cn('shrink-0 size-16 overflow-hidden rounded-md border-2', i === index ? 'border-accent' : 'border-transparent')}>
            <img src={src} alt="" className="size-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function PriceBlock({ listing, inactive }) {
  const [period, setPeriod] = useState('daily');
  const price = listing.type === 'rent' ? listing.rentalPrice[period] : listing.price;
  const days = period === 'weekly' ? 7 : 30;
  const saving = period === 'daily' ? 0 : Math.round((1 - price / (listing.rentalPrice.daily * days)) * 100);
  return (
    <div className="mt-4">
      {listing.type === 'rent' && (
        <Tabs
          className="mb-4 grid w-full grid-cols-3 sm:w-auto"
          items={[{ value: 'daily', label: 'Day' }, { value: 'weekly', label: 'Week' }, { value: 'monthly', label: 'Month' }]}
          value={period}
          onChange={setPeriod}
        />
      )}
      <div aria-live="polite">
        <p className="flex flex-wrap items-baseline gap-1.5">
          <span className={cn('price text-[2rem] font-bold leading-10 text-primary', inactive && 'text-text-secondary line-through')}>
            {formatNumber(price)} DA
          </span>
          {listing.type === 'rent' && <span className="text-base text-text-secondary">/ {periodLabel[period]}</span>}
        </p>
        {saving > 0 && <p className="mt-1 text-sm font-medium text-success">Save {saving}% vs daily</p>}
        {listing.type === 'sale' && listing.negotiable && <p className="mt-1 text-sm text-text-secondary">Price negotiable</p>}
      </div>
    </div>
  );
}

function KeySpecs({ listing }) {
  const specs = [
    { icon: Calendar, label: 'Year', value: String(listing.year) },
    { icon: Gauge, label: 'Mileage', value: `${formatNumber(listing.mileage)} km` },
    { icon: Fuel, label: 'Fuel', value: capitalize(listing.fuelType) },
    { icon: Settings2, label: 'Transmission', value: capitalize(listing.transmission) },
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

function RentalConditions({ listing, className }) {
  const c = listing.rentalConditions;
  const items = [
    `Minimum rental: ${c.minimumDuration}`,
    `Deposit: ${formatNumber(c.deposit)} DA`,
    `Driver aged ${c.minDriverAge} or older`,
    `Driving license held for ${c.licenseYears}+ years`,
  ];
  return (
    <div className={cn('rounded-card bg-muted-soft p-4', className)}>
      <h2 className="text-sm font-semibold text-primary">Rental conditions</h2>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-muted">
            <Check className="size-4 shrink-0 text-success" /> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SellerCard({ listing }) {
  const { seller } = listing;
  const active = mockListings.filter((item) => item.seller.id === seller.id && item.status === 'active').length;
  const since = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(seller.memberSince));
  return (
    <div className="flex gap-3 rounded-card border bg-surface p-4 lg:border-0 lg:p-0">
      <a href={`/seller/${seller.id}`} aria-label={`${seller.name} profile`} className="shrink-0">
        <Avatar src={seller.avatar} name={seller.name} className="size-12" />
      </a>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <a href={`/seller/${seller.id}`} className="text-base font-semibold text-text-primary hover:text-accent hover:underline">{seller.name}</a>
          {seller.isVerified ? <VerifiedBadge /> : <UnverifiedBadge />}
        </div>
        <p className="mt-1 text-sm text-text-secondary">Member since {since} · {active} active listings</p>
        <a href={`/seller/${seller.id}`} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-hover hover:underline">
          View seller profile <ArrowRight className="size-4" />
        </a>
      </div>
    </div>
  );
}

function Specifications({ listing }) {
  const rows = [
    ['Make', listing.make], ['Model', listing.model], ['Year', String(listing.year)],
    ['Mileage', `${formatNumber(listing.mileage)} km`], ['Fuel type', capitalize(listing.fuelType)],
    ['Transmission', capitalize(listing.transmission)],
    ['Body type', listing.bodyType === 'suv' ? 'SUV' : capitalize(listing.bodyType)],
    ['Color', listing.color], ['Listing type', listing.type === 'rent' ? 'For rent' : 'For sale'],
    ['Location', listing.location], ['Listing ID', listing.id.toUpperCase()],
  ];
  return (
    <section aria-labelledby="specs-title">
      <h2 id="specs-title" className="text-2xl font-bold leading-8">Specifications</h2>
      <dl className="mt-5 overflow-hidden rounded-card border">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm odd:bg-background even:bg-surface">
            <dt className="text-text-secondary">{label}</dt>
            <dd className="font-medium text-text-primary">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Description({ text }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section aria-labelledby="description-title">
      <h2 id="description-title" className="text-2xl font-bold leading-8">Description</h2>
      <p id="description-text" className={cn('mt-4 leading-7 text-text-primary', !expanded && 'line-clamp-6')}>{text}</p>
      <Button variant="link" className="mt-2 px-0" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Show less' : 'Read more'}
      </Button>
    </section>
  );
}

function Features({ features }) {
  const [all, setAll] = useState(false);
  const visible = all ? features : features.slice(0, 9);
  return (
    <section aria-labelledby="features-title">
      <h2 id="features-title" className="text-2xl font-bold leading-8">Features</h2>
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
          {all ? 'Show fewer features' : `Show all ${features.length} features`}
        </Button>
      )}
    </section>
  );
}

function LocationBlock({ listing }) {
  return (
    <section aria-labelledby="location-title">
      <h2 id="location-title" className="text-2xl font-bold leading-8">Location</h2>
      <p className="mt-3 text-text-primary">{listing.commune}, {listing.location}</p>
      <div role="img" aria-label={`Approximate location: ${listing.location}`} className="mt-4 flex aspect-[21/9] flex-col items-center justify-center gap-2 rounded-card border bg-muted-soft">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface text-primary shadow-card">
          <MapPin className="size-6" />
        </span>
        <span className="text-sm font-semibold text-primary">{listing.location}</span>
      </div>
      <p className="mt-3 text-sm text-text-secondary">Exact address is shared by the seller in messages.</p>
    </section>
  );
}

function SafetyTips() {
  const tips = [
    'Meet in a public place',
    'Inspect the car and papers (carte grise) before paying',
    'Never send a deposit before seeing the car',
    'Keep the conversation on 33-AutoHub',
  ];
  return (
    <section id="safety" aria-labelledby="safety-title" className="scroll-mt-28 rounded-card bg-accent-soft p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-surface text-success">
          <ShieldCheck className="size-5" />
        </span>
        <h2 id="safety-title" className="text-xl font-semibold leading-7 text-primary">Safety tips</h2>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2 text-sm leading-6 text-primary">
            <Check className="mt-1 size-4 shrink-0 text-accent-hover" /> {tip}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SimilarCars({ listing }) {
  const track = useRef(null);
  const similar = mockListings
    .filter((item) => item.id !== listing.id && item.type === listing.type)
    .map((item) => ({
      item,
      score:
        (item.bodyType === listing.bodyType ? 0 : 1) +
        Math.abs((item.type === 'rent' ? item.rentalPrice.daily : item.price) - (listing.type === 'rent' ? listing.rentalPrice.daily : listing.price)) /
        Math.max(listing.type === 'rent' ? listing.rentalPrice.daily : listing.price, 1) +
        (item.status === 'active' ? 0 : 2),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 8)
    .map(({ item }) => item);

  const scroll = (direction) =>
    track.current?.scrollBy({ left: direction * track.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <section id="similar" className="scroll-mt-28 border-t py-16 lg:py-24">
      <Container>
        <div className="flex items-center justify-between gap-4">
          <SectionHeader title="Similar cars" />
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} className="flex size-9 items-center justify-center rounded-full border hover:bg-muted-soft">
              <ChevronLeft className="size-5" />
            </button>
            <button onClick={() => scroll(1)} className="flex size-9 items-center justify-center rounded-full border hover:bg-muted-soft">
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
        <div ref={track} className="horizontal-scroll -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
          {similar.map((item) => (
            <div key={item.id} className="w-72 shrink-0">
              <ListingCard listing={item} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="mt-5 grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-7"><Skeleton className="aspect-video rounded-card" /></div>
      <div className="lg:col-span-5">
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-24" />
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Listing not found</h1>
          <p className="mt-2 text-text-secondary">This listing may have been removed or doesn&apos;t exist.</p>
          <LinkButton href="/search" variant="accent" className="mt-6">Browse all cars</LinkButton>
        </div>
      </main>
      <Footer />
    </>
  );
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

