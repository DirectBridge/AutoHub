import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle, BadgeCheck, Car, CarFront, Flag, Handshake,
  ListChecks, Lock, Map, MessageSquare, Search, ShieldCheck, Store, Truck,
} from 'lucide-react';
import { Navbar } from '../../component/Navbar/Navbar';
import { Footer } from '../../component/Footer/Footer';
import { Container } from '../../component/Container/Container';
import { HeroSearch } from '../../component/HeroSearch/HeroSearch';
import { SectionHeader } from '../../component/SectionHeader/SectionHeader';
import { ListingGrid } from '../../component/ListingGrid/ListingGrid';
import { ListingCardSkeleton } from '../../component/ListingCard/ListingCard';
import { Tabs } from '../../component/Tabs/Tabs';
import { Button, LinkButton } from '../../component/Button/Button';
import { VerifiedBadge } from '../../component/Badges/Badges';
import { Avatar } from '../../component/Avatar/Avatar';
import './HomePage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const bodyTypes = [
  { label: 'Sedan', count: 382, icon: Car },
  { label: 'SUV', count: 517, icon: CarFront },
  { label: 'Hatchback', count: 291, icon: Car },
  { label: 'Coupe', count: 94, icon: CarFront },
  { label: 'Truck', count: 128, icon: Truck },
  { label: 'Van', count: 86, icon: Truck },
  { label: 'Convertible', count: 42, icon: Car },
];

export function HomePage() {
  const [listingType, setListingType] = useState('sale');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListings = useCallback(async (type, signal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/listings?type=${type}&limit=8`, { signal });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to load listings');
      }
      setListings(payload.listings || []);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Unable to connect to the server.');
      setListings([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchListings(listingType, controller.signal);
    return () => controller.abort();
  }, [listingType, fetchListings]);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative min-h-[39rem] overflow-hidden bg-primary">
          <img
            src="/images/hero-autohub.png"
            alt="Modern dark SUV on a coastal road"
            className="absolute inset-0 size-full object-cover object-[65%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/20" />
          <Container className="relative z-10 pt-16 pb-12 md:pt-20 lg:pt-24">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                Verified sellers · Real listings
              </span>
              <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[2.75rem] tracking-tight text-white md:text-5xl md:leading-[3.5rem]">
                Find Your Perfect Car — Buy, Rent, or Sell
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-footer-text md:text-lg">
                Explore structured listings from trusted sellers across Algeria. Every detail clear, every conversation secure.
              </p>
            </div>
            <div className="mt-9 max-w-6xl">
              <HeroSearch />
            </div>
            <div className="mt-8 grid max-w-3xl grid-cols-1 gap-4 text-white sm:grid-cols-3">
              <TrustStat icon={Store} value="2,400+" label="active listings" />
              <TrustStat icon={BadgeCheck} value="1,100+" label="verified sellers" />
              <TrustStat icon={Map} value="58" label="wilayas covered" />
            </div>
          </Container>
        </section>

        {/* Browse by body type */}
        <section className="py-16 lg:py-24">
          <Container>
            <SectionHeader title="Browse by body type" description="Start with the shape that fits your life." />
            <div className="horizontal-scroll -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:px-0 lg:grid-cols-7">
              {bodyTypes.map(({ label, count, icon: Icon }) => (
                <a
                  key={label}
                  href={`/search?body=${label.toLowerCase()}`}
                  className="group flex min-w-36 flex-col items-center rounded-card border bg-surface px-4 py-5 text-center shadow-card hover:border-accent"
                >
                  <Icon aria-hidden className="size-10 text-primary transition group-hover:text-accent" strokeWidth={1.4} />
                  <span className="mt-3 text-sm font-semibold text-primary">{label}</span>
                  <span className="mt-1 text-xs text-text-secondary">{count} listings</span>
                </a>
              ))}
            </div>
          </Container>
        </section>

        {/* Featured listings */}
        <section id="featured" className="border-y bg-surface py-16 lg:py-24">
          <Container>
            <SectionHeader eyebrow="Featured" title="Hand-picked cars from verified sellers" link={`/search?type=${listingType}`} />
            <Tabs
              className="mb-7"
              items={[{ value: 'sale', label: 'For sale' }, { value: 'rent', label: 'For rent' }]}
              value={listingType}
              onChange={setListingType}
            />
            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }, (_, index) => (
                  <ListingCardSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <div role="alert" className="flex flex-col gap-3 rounded-card border border-danger/30 bg-background p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-danger" />
                  <div>
                    <p className="font-semibold text-primary">Could not load listings from the database</p>
                    <p className="mt-1 text-sm text-text-secondary">{error}</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => fetchListings(listingType)}>
                  Retry
                </Button>
              </div>
            ) : listings.length === 0 ? (
              <div className="rounded-card border bg-background p-8 text-center">
                <p className="font-semibold text-primary">No active listings found</p>
                <p className="mt-1 text-sm text-text-secondary">
                  There are currently no active cars {listingType === 'sale' ? 'for sale' : 'for rent'} in the database.
                </p>
              </div>
            ) : (
              <ListingGrid listings={listings} />
            )}
          </Container>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-16 lg:py-24">
          <Container>
            <SectionHeader eyebrow="Simple and secure" title="From search to keys in three steps" />
            <div className="relative grid gap-10 md:grid-cols-3 md:gap-8">
              <div className="absolute left-[16.66%] right-[16.66%] top-8 hidden border-t-2 border-dashed border-secondary/30 md:block" />
              <Step number="1" icon={Search} title="Search" text="Filter thousands of structured listings by price, year, fuel and more." />
              <Step number="2" icon={MessageSquare} title="Connect" text="Message sellers directly and safely inside the platform." />
              <Step number="3" icon={Handshake} title="Deal" text="Meet, inspect and close the deal with confidence." />
            </div>
          </Container>
        </section>

        {/* Trust section */}
        <section className="border-y bg-muted-soft py-16 lg:py-24">
          <Container className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Built on trust</p>
              <h2 className="mt-3 text-3xl font-bold leading-10 text-primary">Why trust 33-AutoHub?</h2>
              <p className="mt-4 leading-7 text-text-secondary">
                We make trust visible at every step, from identity checks to structured vehicle details and private conversations.
              </p>
              <LinkButton href="#" className="mt-4">Learn about verification</LinkButton>
              <div className="mt-7 flex items-center gap-3 rounded-card border bg-surface p-4 shadow-card">
                <Avatar src="https://i.pravatar.cc/160?img=47" name="Amina R." />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-primary">Amina R.</p>
                  <p className="text-xs text-text-secondary">Member since 2022</p>
                </div>
                <VerifiedBadge />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Feature icon={ShieldCheck} title="Verified sellers" text="Identity and dealership checks make trusted sellers easy to spot." />
              <Feature icon={Lock} title="Secure messaging" text="Keep conversations private and protected inside the platform." />
              <Feature icon={ListChecks} title="Structured listings" text="Compare clear, consistent details without the guesswork." />
              <Feature icon={Flag} title="Active moderation" text="Our team reviews reports and removes suspicious content." />
            </div>
          </Container>
        </section>

        {/* CTA */}
        <section id="sell" className="py-16 lg:py-24">
          <Container>
            <div className="relative overflow-hidden rounded-[1.5rem] bg-primary px-6 py-12 text-white md:px-12 lg:flex lg:items-center lg:justify-between lg:py-14">
              <div className="absolute -right-24 -top-28 size-72 rounded-full bg-accent/25 blur-3xl" />
              <div className="relative">
                <h2 className="text-2xl font-bold leading-8 md:text-3xl md:leading-10">Have a car to sell or rent?</h2>
                <p className="mt-2 text-footer-text">List it in minutes. Get verified to reach more buyers.</p>
              </div>
              <div className="relative mt-7 flex flex-wrap gap-3 lg:mt-0">
                <Button variant="accent" size="lg">Post a listing</Button>
                <Button variant="secondary" size="lg" className="border-white bg-transparent text-white hover:bg-white/10">
                  How verification works
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

function TrustStat({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-full bg-white/10">
        <Icon className="size-5 text-accent-soft" />
      </span>
      <span>
        <strong className="block text-sm font-semibold">{value}</strong>
        <span className="text-xs text-footer-text">{label}</span>
      </span>
    </div>
  );
}

function Step({ number, icon: Icon, title, text }) {
  return (
    <div className="relative z-10 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full border bg-surface shadow-card">
        <Icon className="size-6 text-primary" />
      </div>
      <span className="mx-auto -mt-2 flex size-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
        {number}
      </span>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">{text}</p>
    </div>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="rounded-card border bg-surface p-5 shadow-card">
      <span className="flex size-10 items-center justify-center rounded-button bg-navy-soft text-primary">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{text}</p>
    </div>
  );
}

