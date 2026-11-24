import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle, ArrowUpDown, ChevronLeft, ChevronRight,
  LayoutGrid, List, Search, SearchX, ShieldCheck, SlidersHorizontal, X,
} from 'lucide-react';
import { Navbar } from '../../component/Navbar/Navbar';
import { Footer } from '../../component/Footer/Footer';
import { Container } from '../../component/Container/Container';
import { Input, Select } from '../../component/Input/Input';
import { Button } from '../../component/Button/Button';
import { ListingCard, ListingCardSkeleton } from '../../component/ListingCard/ListingCard';
import { SectionHeader } from '../../component/SectionHeader/SectionHeader';
import { mockListings } from '../../data/mockListings';
import { filterListings, parseListingFilters } from '../../utils/filterListings';
import { cn, formatNumber } from '../../lib/utils';
import './SearchResultsPage.css';

const perPage = 12;

export function SearchResultsPage() {
  const [params, setParams] = useState(() => new URLSearchParams(window.location.search));
  const [keyword, setKeyword] = useState(() => params.get('q') ?? '');
  const [loading, setLoading] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const resultsTop = useRef(null);
  const filters = useMemo(() => parseListingFilters(params), [params]);
  const results = useMemo(() => filterListings(mockListings, filters), [filters]);
  const totalPages = Math.max(1, Math.ceil(results.length / perPage));
  const page = Math.min(filters.page, totalPages);
  const pageResults = results.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    const onPopState = () => {
      const next = new URLSearchParams(window.location.search);
      setParams(next);
      setKeyword(next.get('q') ?? '');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 400);
    return () => window.clearTimeout(timer);
  }, [params.toString()]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (keyword !== (params.get('q') ?? '')) updateParam('q', keyword || undefined);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  const commit = (next) => {
    const query = next.toString();
    window.history.pushState({}, '', `/search${query ? `?${query}` : ''}`);
    setParams(new URLSearchParams(next));
  };

  useEffect(() => {
    const query = params.toString();
    sessionStorage.setItem('autohub:lastSearch', `/search${query ? `?${query}` : ''}`);
  }, [params]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === undefined || value === '') next.delete(key);
    else next.set(key, value);
    if (key === 'type') { next.delete('priceMin'); next.delete('priceMax'); }
    if (key !== 'page') next.delete('page');
    commit(next);
  };

  const clearAll = () => {
    const preserved = new URLSearchParams();
    if (params.get('view')) preserved.set('view', params.get('view'));
    commit(preserved);
    setKeyword('');
  };

  const changePage = (nextPage) => {
    updateParam('page', String(nextPage));
    window.setTimeout(() => resultsTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const title = filters.type === 'rent' ? 'Cars for rent' : filters.type === 'sale' ? 'Cars for sale' : 'All cars';
  const rangeStart = results.length ? (page - 1) * perPage + 1 : 0;
  const rangeEnd = Math.min(page * perPage, results.length);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Container className="py-8 lg:py-10">
          <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
            <a href="/" className="hover:text-accent">Home</a>
            <span className="mx-2">/</span>
            <span className="font-medium text-primary">
              {filters.type === 'rent' ? 'Rent' : filters.type === 'sale' ? 'Buy' : 'Search'}
            </span>
          </nav>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <h1 className="text-[2rem] font-bold leading-10 text-text-primary">{title}</h1>
            <span aria-live="polite" className={cn('text-base text-text-secondary', loading && 'opacity-50')}>
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
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div ref={resultsTop} className="mt-8 min-w-0 scroll-mt-28">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p aria-live="polite" className={cn('text-sm text-text-secondary', loading && 'opacity-50')}>
                Showing {rangeStart}–{rangeEnd} of {results.length} cars
              </p>
              <div className="flex items-center gap-2">
                <Select label="Sort results" hideLabel value={filters.sort} onChange={(e) => updateParam('sort', e.target.value)} className="w-48">
                  <option value="newest">Newest first</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                  <option value="mileage_asc">Mileage: lowest first</option>
                  <option value="year_desc">Year: newest first</option>
                </Select>
                <div className="hidden rounded-button border bg-surface p-1 sm:flex">
                  <button
                    aria-label="Grid view" aria-pressed={filters.view === 'grid'}
                    onClick={() => updateParam('view', 'grid')}
                    className={cn('flex size-8 items-center justify-center rounded-md text-text-secondary', filters.view === 'grid' && 'bg-primary text-white')}
                  >
                    <LayoutGrid className="size-4" />
                  </button>
                  <button
                    aria-label="List view" aria-pressed={filters.view === 'list'}
                    onClick={() => updateParam('view', 'list')}
                    className={cn('flex size-8 items-center justify-center rounded-md text-text-secondary', filters.view === 'list' && 'bg-primary text-white')}
                  >
                    <List className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => <ListingCardSkeleton key={i} />)}
              </div>
            ) : results.length === 0 ? (
              <EmptyState onClear={clearAll} />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {pageResults.map((listing, index) => (
                  <Fragment key={listing.id}>
                    <ListingCard listing={listing} />
                    {index === 5 && (
                      <div className="col-span-full flex flex-col gap-4 rounded-card border border-accent/20 bg-accent-soft p-5 sm:flex-row sm:items-center">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-success">
                          <ShieldCheck className="size-5" />
                        </span>
                        <p className="flex-1 text-sm font-medium text-primary">
                          Prefer verified sellers? Their identity has been checked by our team.
                        </p>
                        <button onClick={() => updateParam('verified', 'true')} className="text-left text-sm font-semibold text-accent-hover">
                          Show verified only
                        </button>
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
            )}

            {!loading && results.length > 0 && (
              <Pagination page={page} totalPages={totalPages} onChange={changePage} />
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

function EmptyState({ onClear }) {
  return (
    <div className="rounded-card border bg-surface px-6 py-14 text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted-soft text-primary">
        <SearchX className="size-7" />
      </span>
      <h3 className="mt-5 text-xl font-semibold">No cars match these filters</h3>
      <p className="mt-2 text-sm text-text-secondary">Try removing a filter or widening your price range.</p>
      <Button className="mt-6" onClick={onClear}>Clear all filters</Button>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  const pages = paginationItems(page, totalPages);
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1">
      <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="size-4" /><span className="hidden sm:inline">Previous</span>
      </Button>
      {pages.map((item, index) =>
        item === '…' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-text-secondary">…</span>
        ) : (
          <button
            key={item}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onChange(item)}
            className={cn(
              'flex size-9 items-center justify-center rounded-button text-sm font-semibold text-primary hover:bg-muted-soft',
              item === page && 'bg-primary text-white hover:bg-primary-hover',
            )}
          >
            {item}
          </button>
        )
      )}
      <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
        <span className="hidden sm:inline">Next</span><ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}

function paginationItems(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (page >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', page - 1, page, page + 1, '…', total];
}

