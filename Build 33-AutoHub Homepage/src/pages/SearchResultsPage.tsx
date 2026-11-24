import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Search,
  SearchX,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/ListingCard";
import {
  ListingCardHorizontal,
  ListingCardHorizontalSkeleton,
} from "@/components/listings/ListingCardHorizontal";
import { FilterPanel } from "@/components/search/FilterPanel";
import { SectionHeader } from "@/components/common/SectionHeader";
import { mockListings } from "@/data/mockListings";
import { filterListings, parseListingFilters, type ListingFilters } from "@/utils/filterListings";
import { cn, formatNumber } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const perPage = 12;

export function SearchResultsPage() {
  const [params, setParams] = useState(() => new URLSearchParams(window.location.search));
  const [keyword, setKeyword] = useState(() => params.get("q") ?? "");
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [draftParams, setDraftParams] = useState(() => new URLSearchParams(params));
  const resultsTop = useRef<HTMLDivElement>(null);
  const filters = useMemo(() => parseListingFilters(params), [params]);
  const results = useMemo(() => filterListings(mockListings, filters), [filters]);
  const totalPages = Math.max(1, Math.ceil(results.length / perPage));
  const page = Math.min(filters.page, totalPages);
  const pageResults = results.slice((page - 1) * perPage, page * perPage);
  const filterCount = countFilters(params);
  const { user } = useAuth();
  const loggedIn = Boolean(user);
  const hasError = params.get("error") === "1";

  useEffect(() => {
    const onPopState = () => {
      const next = new URLSearchParams(window.location.search);
      setParams(next);
      setKeyword(next.get("q") ?? "");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 400);
    return () => window.clearTimeout(timer);
  }, [params.toString()]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (keyword !== (params.get("q") ?? "")) updateParam("q", keyword || undefined);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  const commit = (next: URLSearchParams) => {
    const query = next.toString();
    window.history.pushState({}, "", `/search${query ? `?${query}` : ""}`);
    setParams(new URLSearchParams(next));
  };

  // Remember the latest search so the listing breadcrumb can return to it.
  useEffect(() => {
    const query = params.toString();
    sessionStorage.setItem("autohub:lastSearch", `/search${query ? `?${query}` : ""}`);
  }, [params]);

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value === undefined || value === "") next.delete(key);
    else next.set(key, value);
    if (key === "type") {
      next.delete("priceMin");
      next.delete("priceMax");
    }
    if (key !== "page") next.delete("page");
    commit(next);
  };

  const clearAll = () => {
    const preserved = new URLSearchParams();
    if (params.get("view")) preserved.set("view", params.get("view")!);
    commit(preserved);
    setKeyword("");
  };

  const changePage = (nextPage: number) => {
    updateParam("page", String(nextPage));
    window.setTimeout(
      () => resultsTop.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      0,
    );
  };

  const title =
    filters.type === "rent"
      ? "Cars for rent"
      : filters.type === "sale"
        ? "Cars for sale"
        : "All cars";
  const rangeStart = results.length ? (page - 1) * perPage + 1 : 0;
  const rangeEnd = Math.min(page * perPage, results.length);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Container className="py-8 lg:py-10">
          <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
            <a href="/" className="hover:text-accent">
              Home
            </a>
            <span className="mx-2">/</span>
            <span className="font-medium text-primary">
              {filters.type === "rent" ? "Rent" : filters.type === "sale" ? "Buy" : "Search"}
            </span>
          </nav>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <h1 className="text-[2rem] font-bold leading-10 text-text-primary">{title}</h1>
            <span
              aria-live="polite"
              className={cn("text-base text-text-secondary", loading && "opacity-50")}
            >
              {results.length} results
            </span>
          </div>

          <div className="mt-6">
            <Input
              label="Search by make, model or keyword"
              icon={<Search className="size-5" />}
              value={keyword}
              type="search"
              placeholder="Search make, model or keyword"
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>

          <div className="sticky top-[4.5rem] z-30 -mx-4 mt-4 grid grid-cols-2 gap-2 border-y bg-surface/95 px-4 py-3 backdrop-blur-sm lg:hidden">
            <Button
              variant="secondary"
              onClick={() => {
                setDraftParams(new URLSearchParams(params));
                setFilterOpen(true);
              }}
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {filterCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {filterCount}
                </span>
              )}
            </Button>
            <Button variant="secondary" onClick={() => setSortOpen(true)}>
              <ArrowUpDown className="size-4" />
              Sort
            </Button>
          </div>

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[18.5rem_minmax(0,1fr)]">
            <aside
              aria-label="Filters"
              className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto lg:block"
            >
              <FilterPanel
                params={params}
                onParam={updateParam}
                onClear={clearAll}
                resultCount={results.length}
                loggedIn={loggedIn}
              />
            </aside>

            <div ref={resultsTop} className="min-w-0 scroll-mt-28">
              <ActiveFilterChips
                params={params}
                filters={filters}
                onRemove={(key, value) => removeFilter(params, key, value, commit)}
                onClear={clearAll}
              />

              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p
                  aria-live="polite"
                  className={cn("text-sm text-text-secondary", loading && "opacity-50")}
                >
                  Showing {rangeStart}–{rangeEnd} of {results.length} cars
                </p>
                <div className="flex items-center gap-2">
                  <Select
                    label="Sort results"
                    hideLabel
                    value={filters.sort}
                    onChange={(event) => updateParam("sort", event.target.value)}
                    className="w-48"
                  >
                    <option value="newest">Newest first</option>
                    <option value="price_asc">Price: low to high</option>
                    <option value="price_desc">Price: high to low</option>
                    <option value="mileage_asc">Mileage: lowest first</option>
                    <option value="year_desc">Year: newest first</option>
                  </Select>
                  <div className="hidden rounded-button border bg-surface p-1 sm:flex">
                    <button
                      aria-label="Grid view"
                      aria-pressed={filters.view === "grid"}
                      onClick={() => updateParam("view", "grid")}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-md text-text-secondary",
                        filters.view === "grid" && "bg-primary text-white",
                      )}
                    >
                      <LayoutGrid className="size-4" />
                    </button>
                    <button
                      aria-label="List view"
                      aria-pressed={filters.view === "list"}
                      onClick={() => updateParam("view", "list")}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-md text-text-secondary",
                        filters.view === "list" && "bg-primary text-white",
                      )}
                    >
                      <List className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              {hasError ? (
                <ErrorState onRetry={() => updateParam("error")} />
              ) : loading ? (
                <LoadingResults view={filters.view} />
              ) : results.length === 0 ? (
                <EmptyState params={params} filters={filters} onClear={clearAll} commit={commit} />
              ) : filters.view === "grid" ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {pageResults.map((listing, index) => (
                    <Fragment key={listing.id}>
                      <ListingCard listing={listing} />
                      {index === 5 && (
                        <TrustBanner onClick={() => updateParam("verified", "true")} />
                      )}
                    </Fragment>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  {pageResults.map((listing) => (
                    <ListingCardHorizontal key={listing.id} listing={listing} />
                  ))}
                </div>
              )}

              {!loading && !hasError && results.length > 0 && (
                <Pagination page={page} totalPages={totalPages} onChange={changePage} />
              )}
            </div>
          </div>
        </Container>
      </main>
      <Footer />

      {filterOpen && (
        <FocusSheet
          title="Filters"
          onClose={() => setFilterOpen(false)}
          headerAction={
            <button
              className="text-sm font-semibold text-accent"
              onClick={() => setDraftParams(new URLSearchParams())}
            >
              Clear all
            </button>
          }
          footer={
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={() => {
                commit(draftParams);
                setFilterOpen(false);
              }}
            >
              Show {filterListings(mockListings, parseListingFilters(draftParams)).length} results
            </Button>
          }
        >
          <FilterPanel
            params={draftParams}
            onParam={(key, value) =>
              setDraftParams((current) => {
                const next = new URLSearchParams(current);
                if (value === undefined || value === "") next.delete(key);
                else next.set(key, value);
                if (key === "type") {
                  next.delete("priceMin");
                  next.delete("priceMax");
                }
                next.delete("page");
                return next;
              })
            }
            onClear={() => setDraftParams(new URLSearchParams())}
            resultCount={filterListings(mockListings, parseListingFilters(draftParams)).length}
            loggedIn={loggedIn}
          />
        </FocusSheet>
      )}

      {sortOpen && (
        <FocusSheet title="Sort results" onClose={() => setSortOpen(false)}>
          <div className="grid gap-1 p-4">
            {[
              ["newest", "Newest first"],
              ["price_asc", "Price: low to high"],
              ["price_desc", "Price: high to low"],
              ["mileage_asc", "Mileage: lowest first"],
              ["year_desc", "Year: newest first"],
            ].map(([value, label]) => (
              <label
                key={value}
                className="flex items-center gap-3 rounded-button px-3 py-3 text-sm font-medium hover:bg-muted-soft"
              >
                <input
                  type="radio"
                  name="sort"
                  value={value}
                  checked={filters.sort === value}
                  onChange={() => {
                    updateParam("sort", value);
                    setSortOpen(false);
                  }}
                  className="size-4 accent-accent"
                />
                {label}
              </label>
            ))}
          </div>
        </FocusSheet>
      )}

      <button
        className="sr-only focus:not-sr-only focus:fixed focus:bottom-4 focus:left-4 focus:z-[80] focus:rounded-button focus:bg-danger focus:px-4 focus:py-2 focus:text-white"
        onClick={() => updateParam("error", hasError ? undefined : "1")}
      >
        Toggle simulated results error
      </button>
    </>
  );
}

function ActiveFilterChips({
  params,
  filters,
  onRemove,
  onClear,
}: {
  params: URLSearchParams;
  filters: ListingFilters;
  onRemove: (key: string, value?: string) => void;
  onClear: () => void;
}) {
  const chips = buildChips(filters);
  if (!chips.length) return null;
  return (
    <div className="horizontal-scroll mb-5 flex gap-2 overflow-x-auto pb-1 lg:flex-wrap">
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value}`}
          onClick={() => onRemove(chip.key, chip.value)}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted-soft px-3 py-1.5 text-xs font-medium text-primary hover:bg-border"
        >
          {chip.label}
          <X className="size-3.5" />
        </button>
      ))}
      <button
        onClick={onClear}
        className="shrink-0 px-2 text-xs font-semibold text-accent hover:text-accent-hover"
      >
        Clear all
      </button>
    </div>
  );
}

function buildChips(filters: ListingFilters) {
  const chips: { key: string; value?: string; label: string }[] = [];
  if (filters.type)
    chips.push({ key: "type", label: filters.type === "sale" ? "For sale" : "For rent" });
  if (filters.q) chips.push({ key: "q", label: `“${filters.q}”` });
  if (filters.make) chips.push({ key: "make", label: filters.make });
  if (filters.model) chips.push({ key: "model", label: filters.model });
  filters.body.forEach((value) => chips.push({ key: "body", value, label: capitalize(value) }));
  filters.fuel.forEach((value) => chips.push({ key: "fuel", value, label: capitalize(value) }));
  filters.transmission.forEach((value) =>
    chips.push({ key: "transmission", value, label: capitalize(value) }),
  );
  filters.color.forEach((value) => chips.push({ key: "color", value, label: capitalize(value) }));
  if (filters.priceMin !== undefined)
    chips.push({ key: "priceMin", label: `≥ ${formatNumber(filters.priceMin)} DA` });
  if (filters.priceMax !== undefined)
    chips.push({ key: "priceMax", label: `≤ ${formatNumber(filters.priceMax)} DA` });
  if (filters.yearMin) chips.push({ key: "yearMin", label: `From ${filters.yearMin}` });
  if (filters.yearMax) chips.push({ key: "yearMax", label: `To ${filters.yearMax}` });
  if (filters.mileageMax !== undefined)
    chips.push({ key: "mileageMax", label: `≤ ${formatNumber(filters.mileageMax)} km` });
  if (filters.location) chips.push({ key: "location", label: filters.location });
  if (filters.verified) chips.push({ key: "verified", label: "Verified only" });
  return chips;
}

function removeFilter(
  params: URLSearchParams,
  key: string,
  value: string | undefined,
  commit: (next: URLSearchParams) => void,
) {
  const next = new URLSearchParams(params);
  if (value) {
    const values =
      next
        .get(key)
        ?.split(",")
        .filter((item) => item !== value) ?? [];
    if (values.length) next.set(key, values.join(","));
    else next.delete(key);
  } else next.delete(key);
  next.delete("page");
  commit(next);
}

function LoadingResults({ view }: { view: "grid" | "list" }) {
  if (view === "list")
    return (
      <div className="grid gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <ListingCardHorizontalSkeleton key={index} />
        ))}
      </div>
    );
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <ListingCardSkeleton key={index} />
      ))}
    </div>
  );
}

function EmptyState({
  params,
  filters,
  onClear,
  commit,
}: {
  params: URLSearchParams;
  filters: ListingFilters;
  onClear: () => void;
  commit: (next: URLSearchParams) => void;
}) {
  return (
    <div>
      <div className="rounded-card border bg-surface px-6 py-14 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted-soft text-primary">
          <SearchX className="size-7" />
        </span>
        <h3 className="mt-5 text-xl font-semibold">No cars match these filters</h3>
        <p className="mt-2 text-sm text-text-secondary">
          Try removing a filter or widening your price range.
        </p>
        <div className="mx-auto mt-5 flex max-w-xl flex-wrap justify-center gap-2">
          {buildChips(filters).map((chip) => (
            <button
              key={`${chip.key}-${chip.value}`}
              onClick={() => removeFilter(params, chip.key, chip.value, commit)}
              className="inline-flex items-center gap-1 rounded-full bg-muted-soft px-3 py-1.5 text-xs font-medium"
            >
              {chip.label}
              <X className="size-3.5" />
            </button>
          ))}
        </div>
        <Button className="mt-6" onClick={onClear}>
          Clear all filters
        </Button>
      </div>
      <div className="mt-12">
        <SectionHeader title="You might like" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {mockListings
            .filter((listing) => listing.status === "active")
            .slice(0, 4)
            .map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-card border border-danger/30 bg-surface p-5"
    >
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-danger" />
      <div>
        <h3 className="font-semibold text-primary">Something went wrong while loading results.</h3>
        <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}

function TrustBanner({ onClick }: { onClick: () => void }) {
  return (
    <div className="col-span-full flex flex-col gap-4 rounded-card border border-accent/20 bg-accent-soft p-5 sm:flex-row sm:items-center">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-success">
        <ShieldCheck className="size-5" />
      </span>
      <p className="flex-1 text-sm font-medium text-primary">
        Prefer verified sellers? Their identity has been checked by our team.
      </p>
      <button onClick={onClick} className="text-left text-sm font-semibold text-accent-hover">
        Show verified only
      </button>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const pages = paginationItems(page, totalPages);
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1">
      <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="size-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>
      {pages.map((item, index) =>
        item === "…" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-text-secondary">
            …
          </span>
        ) : (
          <button
            key={item}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onChange(item)}
            className={cn(
              "flex size-9 items-center justify-center rounded-button text-sm font-semibold text-primary hover:bg-muted-soft",
              item === page && "bg-primary text-white hover:bg-primary-hover",
            )}
          >
            {item}
          </button>
        ),
      )}
      <Button
        variant="ghost"
        size="sm"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}

function paginationItems(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (page >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", page - 1, page, page + 1, "…", total];
}

function FocusSheet({
  title,
  onClose,
  headerAction,
  footer,
  children,
}: {
  title: string;
  onClose: () => void;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const opener = useRef(document.activeElement as HTMLElement | null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const sheet = sheetRef.current;
    sheet?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
      if (event.key !== "Tab" || !sheet) return;
      const focusable = [
        ...sheet.querySelectorAll<HTMLElement>(
          'button, input, select, [href], [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((element) => !element.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      opener.current?.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end bg-primary/40 lg:hidden"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="flex max-h-[92vh] w-full flex-col rounded-t-modal bg-surface shadow-float"
      >
        <div className="flex shrink-0 items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
              <X className="size-5" />
            </Button>
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          {headerAction}
        </div>
        <div className="overflow-y-auto">{children}</div>
        {footer && <div className="shrink-0 border-t bg-surface p-4">{footer}</div>}
      </div>
    </div>
  );
}

function countFilters(params: URLSearchParams) {
  return [...params.keys()].filter(
    (key) => !["sort", "view", "page", "auth", "error"].includes(key),
  ).length;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
