import { useState } from "react";
import { Mail, Search } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import {
  ListingTypeBadge,
  NewBadge,
  StatusBadge,
  UnverifiedBadge,
  VerifiedBadge,
} from "@/components/common/Badges";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/ListingCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { mockListings } from "@/data/mockListings";

const colors = [
  ["Primary", "#1B2A4A", "Headings, primary actions", "14.0:1 on white", "bg-primary"],
  ["Primary hover", "#142038", "Primary hover state", "16.1:1 on white", "bg-primary-hover"],
  ["Accent", "#0F766E", "CTAs, links, active states", "5.4:1 on white", "bg-accent"],
  ["Accent soft", "#CCFBF1", "Sale badge background", "5.5:1 with accent hover", "bg-accent-soft"],
  ["Secondary", "#6B7B8D", "Icons and borders only", "—", "bg-secondary"],
  ["Background", "#F8FAFB", "Page background", "14.8:1 with text", "bg-background"],
  ["Surface", "#FFFFFF", "Cards and panels", "15.1:1 with text", "bg-surface"],
  ["Border", "#E2E8F0", "Dividers and borders", "—", "bg-border"],
  ["Text primary", "#1A1A2E", "Primary content", "15.1:1 on white", "bg-text-primary"],
  ["Text secondary", "#64748B", "Metadata and captions", "4.8:1 on white", "bg-text-secondary"],
  ["Success", "#047857", "Verified status", "5.5:1 on soft green", "bg-success"],
  ["Warning", "#B45309", "Unverified status", "4.6:1 on soft amber", "bg-warning"],
  ["Danger", "#DC2626", "Errors and destructive", "4.8:1 on white", "bg-danger"],
  ["Rent / info", "#1D4ED8", "Rental listing badge", "5.3:1 on soft blue", "bg-rent"],
  ["Muted", "#475569", "Inactive statuses", "7.0:1 on muted soft", "bg-muted"],
];

export function DesignSystemPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const sold = { ...mockListings[0], status: "sold" as const };
  const rented = { ...mockListings[9], status: "rented" as const };
  const unverified = {
    ...mockListings[2],
    seller: { ...mockListings[2].seller, isVerified: false },
  };

  return (
    <>
      <Navbar loggedIn={loggedIn} />
      <main>
        <section className="border-b bg-surface py-14">
          <Container>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  33-AutoHub
                </p>
                <h1 className="mt-2 text-4xl font-bold leading-[2.75rem] text-primary">
                  Design system
                </h1>
                <p className="mt-3 max-w-2xl text-text-secondary">
                  Reusable foundations and components for a premium, trustworthy automotive
                  marketplace.
                </p>
              </div>
              <label className="flex items-center gap-3 rounded-card border bg-background p-3 text-sm font-medium text-primary">
                Logged-in navbar
                <button
                  role="switch"
                  aria-checked={loggedIn}
                  onClick={() => setLoggedIn(!loggedIn)}
                  className={`relative h-6 w-11 rounded-full ${loggedIn ? "bg-accent" : "bg-secondary"}`}
                >
                  <span
                    className={`absolute top-1 size-4 rounded-full bg-white transition ${loggedIn ? "left-6" : "left-1"}`}
                  />
                </button>
              </label>
            </div>
          </Container>
        </section>

        <DocsSection
          title="Color"
          description="Semantic roles with accessible text/background pairings."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {colors.map(([name, hex, role, ratio, swatch]) => (
              <div key={name} className="flex overflow-hidden rounded-card border bg-surface">
                <div className={`w-16 shrink-0 ${swatch}`} />
                <div className="p-3">
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-text-secondary">{hex}</p>
                  <p className="mt-2 text-xs">{role}</p>
                  <p className="mt-1 text-xs font-medium text-accent">{ratio}</p>
                </div>
              </div>
            ))}
          </div>
        </DocsSection>

        <DocsSection
          title="Typography"
          description="Inter for UI, Plus Jakarta Sans ExtraBold for hero and wordmark."
        >
          <div className="space-y-6 rounded-card border bg-surface p-6">
            <TypeRow
              label="Display · 48/56"
              className="font-display text-4xl leading-[2.75rem] md:text-5xl md:leading-[3.5rem]"
            >
              Find your perfect car
            </TypeRow>
            <TypeRow label="H1 · 32/40" className="text-[2rem] font-bold leading-10">
              Marketplace heading
            </TypeRow>
            <TypeRow label="H2 · 24/32" className="text-2xl font-bold leading-8">
              Section heading
            </TypeRow>
            <TypeRow label="H3 · 20/28" className="text-xl font-semibold leading-7">
              Component heading
            </TypeRow>
            <TypeRow label="Body · 16/24" className="text-base leading-6">
              Clear information helps buyers make confident decisions.
            </TypeRow>
            <TypeRow label="Small · 14/20" className="text-sm leading-5">
              Supporting information and metadata.
            </TypeRow>
            <TypeRow label="Caption · 12/16" className="text-xs font-medium leading-4">
              CAPTION AND BADGES
            </TypeRow>
            <TypeRow label="Price · Inter 700" className="price text-2xl font-bold">
              3 450 000 DA
            </TypeRow>
          </div>
        </DocsSection>

        <DocsSection title="Spacing, radius & elevation">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-card border bg-surface p-5">
              <h3 className="font-semibold">4px spacing grid</h3>
              <div className="mt-4 flex items-end gap-3">
                {[1, 2, 3, 4, 6, 8, 12, 16].map((space) => (
                  <div key={space} className="text-center">
                    <div className="w-4 bg-accent" style={{ height: `${space * 4}px` }} />
                    <span className="mt-1 block text-xs text-text-secondary">{space * 4}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-card border bg-surface p-5">
              <h3 className="font-semibold">Radius</h3>
              <div className="mt-4 flex gap-3">
                <span className="size-16 rounded-button border bg-muted-soft" />
                <span className="size-16 rounded-card border bg-muted-soft" />
                <span className="size-16 rounded-modal border bg-muted-soft" />
                <span className="size-16 rounded-full border bg-muted-soft" />
              </div>
            </div>
            <div className="rounded-card border bg-surface p-5">
              <h3 className="font-semibold">Shadows</h3>
              <div className="mt-4 flex gap-4">
                <span className="size-20 rounded-card bg-surface shadow-card" />
                <span className="size-20 rounded-card bg-surface shadow-card-hover" />
              </div>
            </div>
          </div>
        </DocsSection>

        <DocsSection title="Buttons" description="Variants, sizes and interaction states.">
          <div className="space-y-6 rounded-card border bg-surface p-5">
            {(["primary", "accent", "secondary", "ghost", "destructive", "link"] as const).map(
              (variant) => (
                <div key={variant} className="flex flex-wrap items-center gap-3">
                  <span className="w-24 text-sm font-medium capitalize">{variant}</span>
                  <Button variant={variant} size="sm">
                    Small
                  </Button>
                  <Button variant={variant}>Medium</Button>
                  <Button variant={variant} size="lg">
                    Large
                  </Button>
                  <Button variant={variant} disabled>
                    Disabled
                  </Button>
                  <Button variant={variant} loading>
                    Loading
                  </Button>
                </div>
              ),
            )}
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-24 text-sm font-medium">Icon</span>
              <Button variant="accent">
                <Search className="size-4" />
                Leading
              </Button>
              <Button size="icon" aria-label="Search">
                <Search className="size-5" />
              </Button>
              <Button variant="primary" className="bg-primary-hover shadow-card">
                Hover
              </Button>
              <Button variant="accent" className="ring-2 ring-accent ring-offset-2">
                Focus
              </Button>
            </div>
          </div>
        </DocsSection>

        <DocsSection
          title="Inputs"
          description="Labels stay visible outside the compact hero search context."
        >
          <div className="grid gap-5 rounded-card border bg-surface p-5 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Full name" placeholder="Enter your name" />
            <Input label="Email address" value="amina@example.com" readOnly />
            <Input
              label="Email with icon"
              icon={<Mail className="size-4" />}
              placeholder="name@email.com"
            />
            <Input
              label="Focused preview"
              placeholder="Focus state"
              className="border-accent ring-2 ring-accent/20"
            />
            <Input
              label="Registration number"
              error="Enter a valid registration number"
              defaultValue="123"
            />
            <Input label="Disabled field" placeholder="Unavailable" disabled />
            <Select label="Body type">
              <option>Select body type</option>
              <option>SUV</option>
              <option>Sedan</option>
            </Select>
            <Input
              label="Search listings"
              icon={<Search className="size-4" />}
              placeholder="Make, model, keyword…"
              type="search"
            />
          </div>
        </DocsSection>

        <DocsSection title="Badges">
          <div className="flex flex-wrap gap-3 rounded-card border bg-surface p-5">
            <ListingTypeBadge type="sale" />
            <ListingTypeBadge type="rent" />
            <StatusBadge status="sold" />
            <StatusBadge status="rented" />
            <VerifiedBadge />
            <VerifiedBadge compact />
            <UnverifiedBadge />
            <UnverifiedBadge compact />
            <NewBadge />
          </div>
        </DocsSection>

        <DocsSection title="Avatars & section headers">
          <div className="rounded-card border bg-surface p-5">
            <div className="mb-8 flex items-center gap-4">
              <Avatar name="Karim B." size="sm" />
              <Avatar name="Amina R." src="https://i.pravatar.cc/160?img=47" />
              <Avatar name="Auto Prestige" size="lg" />
            </div>
            <SectionHeader
              eyebrow="Featured"
              title="Hand-picked cars from verified sellers"
              description="A reusable section heading with optional supporting copy."
              link="#"
            />
          </div>
        </DocsSection>

        <DocsSection
          title="Listing cards"
          description="Every marketplace state uses the same accessible card component."
        >
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <CardExample label="Default">
              <ListingCard listing={mockListings[0]} />
            </CardExample>
            <CardExample label="Hover preview">
              <ListingCard listing={mockListings[1]} forceHover />
            </CardExample>
            <CardExample label="Favorited">
              <ListingCard listing={mockListings[4]} initialFavorite />
            </CardExample>
            <CardExample label="Sold">
              <ListingCard listing={sold} />
            </CardExample>
            <CardExample label="Rented">
              <ListingCard listing={rented} />
            </CardExample>
            <CardExample label="Unverified">
              <ListingCard listing={unverified} />
            </CardExample>
            <CardExample label="Loading skeleton">
              <ListingCardSkeleton />
            </CardExample>
          </div>
        </DocsSection>
      </main>
      <Footer />
    </>
  );
}

function DocsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-12">
      <Container>
        <div className="mb-6">
          <h2 className="text-2xl font-bold leading-8">{title}</h2>
          {description && <p className="mt-2 text-sm text-text-secondary">{description}</p>}
        </div>
        {children}
      </Container>
    </section>
  );
}

function TypeRow({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-[10rem_1fr] md:items-baseline">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      <span className={className}>{children}</span>
    </div>
  );
}

function CardExample({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {label}
      </p>
      {children}
    </div>
  );
}
