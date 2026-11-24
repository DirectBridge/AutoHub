import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft, ChevronRight, LayoutGrid, List, Search, SearchX, ShieldCheck,
} from 'lucide-react';
import { Navbar } from '../../component/Navbar/Navbar';
import { Footer } from '../../component/Footer/Footer';
import { Container } from '../../component/Container/Container';
import { Input, Select } from '../../component/Input/Input';
import { Button } from '../../component/Button/Button';
import { Tabs } from '../../component/Tabs/Tabs';
import { ListingCard, ListingCardSkeleton } from '../../component/ListingCard/ListingCard';
import { parseListingFilters } from '../../utils/filterListings';
import { cn } from '../../lib/utils';
import './SearchResultsPage.css';

const perPage = 12;

export function SearchResultsPage() {
  const [params, setParams] = useState(() => new URLSearchParams(window.location.search));
  const [keyword, setKeyword] = useState(() => params.get('q') ?? params.get('search') ?? '');
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const resultsTop = useRef(null);
  const filters = useMemo(() => parseListingFilters(params), [params]);
  const activeType = filters.type || 'sale';
  const page = filters.page;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  useEffect(() => {
    const onPopState = () => {
      const next = new URLSearchParams(window.location.search);
      setParams(next);
      setKeyword(next.get('q') ?? next.get('search') ?? '');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (keyword !== (params.get('q') ?? params.get('search') ?? '')) updateParam('q', keyword || undefined);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const timer = window.setTimeout(async () => {
      try {
        const query = new URLSearchParams(params);
        query.set('limit', String(perPage));
        if (!query.has('type') && !query.has('purpose')) query.set('type', 'sale');
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiBase}/listings?${query}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load listings.');
        setListings(Array.isArray(data.listings) ? data.listings : []);
        setTotal(Number(data.total) || 0);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setListings([]);
          setTotal(0);
          setError(fetchError.message || 'Could not load listings.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [params.toString()]);

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
    if (key === 'type') {
      next.delete('priceMin'); next.delete('priceMax');
      next.delete('minPrice'); next.delete('maxPrice');
    }
    if (key !== 'page') next.delete('page');
    commit(next);
  };

  const clearAll = () => {
    commit(new URLSearchParams({ type: activeType }));
    setKeyword('');
  };

  const changePage = (nextPage) => {
    updateParam('page', String(nextPage));
    window.setTimeout(() => resultsTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const title = activeType === 'rent' ? 'Cars for rent' : 'Cars for sale';
  const rangeStart = total ? (page - 1) * perPage + 1 : 0;
  const rangeEnd = Math.min((page - 1) * perPage + listings.length, total);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Container className="py-8 lg:py-10">
          <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
            <a href="/" className="hover:text-accent">Home</a>
            <span className="mx-2">/</span>
            <span className="font-medium text-primary">
              {activeType === 'rent' ? 'Rent' : 'Buy'}
            </span>
          </nav>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <h1 className="text-[2rem] font-bold leading-10 text-text-primary">{title}</h1>
            <span aria-live="polite" className={cn('text-base text-text-secondary', loading && 'opacity-50')}>
              {total} results
            </span>
          </div>

          <Tabs
            className="mt-5"
            items={[{ value: 'sale', label: 'For sale' }, { value: 'rent', label: 'For rent' }]}
            value={activeType}
            onChange={(type) => updateParam('type', type)}
          />

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
                Showing {rangeStart}–{rangeEnd} of {total} cars
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
            ) : error ? (
              <div role="alert" className="rounded-card border bg-surface px-6 py-10 text-center text-text-secondary">{error}</div>
            ) : total === 0 ? (
              <EmptyState onClear={clearAll} />
            ) : (
              <div className={filters.view === 'list' ? 'flex flex-col gap-4' : 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3'}>
                {listings.map((listing, index) => (
                  <Fragment key={listing.id}>
                    <ListingCard listing={listing} layout={filters.view} />
                    {filters.view === 'grid' && index === 5 && (
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

            {!loading && total > 0 && (
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

