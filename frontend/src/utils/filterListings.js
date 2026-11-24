function numberParam(params, key) {
  const value = Number(params.get(key));
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

function listParam(params, key) {
  return params.get(key)?.split(',').filter(Boolean).map((v) => v.toLowerCase()) ?? [];
}

export function parseListingFilters(params) {
  const type = params.get('type');
  const sort = params.get('sort');
  return {
    q: params.get('q') || undefined,
    type: type === 'sale' || type === 'rent' ? type : undefined,
    make: params.get('make') || undefined,
    model: params.get('model') || undefined,
    body: listParam(params, 'body'),
    priceMin: numberParam(params, 'priceMin'),
    priceMax: numberParam(params, 'priceMax'),
    yearMin: numberParam(params, 'yearMin'),
    yearMax: numberParam(params, 'yearMax'),
    mileageMax: numberParam(params, 'mileageMax'),
    fuel: listParam(params, 'fuel'),
    transmission: listParam(params, 'transmission'),
    color: listParam(params, 'color'),
    location: params.get('location') || undefined,
    verified: params.get('verified') === 'true',
    sort: ['price_asc','price_desc','mileage_asc','year_desc'].includes(sort) ? sort : 'newest',
    view: params.get('view') === 'list' ? 'list' : 'grid',
    page: Math.max(1, numberParam(params, 'page') ?? 1),
  };
}

export function filterListings(listings, filters) {
  const query = filters.q?.toLowerCase().trim();
  const filtered = listings.filter((listing) => {
    const price = listing.type === 'rent' ? listing.rentalPrice.daily : listing.price;
    return (
      listing.status === 'active' &&
      (!filters.type || listing.type === filters.type) &&
      (!query || `${listing.title} ${listing.make} ${listing.model}`.toLowerCase().includes(query)) &&
      (!filters.make || listing.make === filters.make) &&
      (!filters.model || listing.model === filters.model) &&
      (!filters.body.length || filters.body.includes(listing.bodyType)) &&
      (filters.priceMin === undefined || price >= filters.priceMin) &&
      (filters.priceMax === undefined || price <= filters.priceMax) &&
      (filters.yearMin === undefined || listing.year >= filters.yearMin) &&
      (filters.yearMax === undefined || listing.year <= filters.yearMax) &&
      (filters.mileageMax === undefined || listing.mileage <= filters.mileageMax) &&
      (!filters.fuel.length || filters.fuel.includes(listing.fuelType)) &&
      (!filters.transmission.length || filters.transmission.includes(listing.transmission)) &&
      (!filters.color.length || filters.color.includes(listing.color.toLowerCase())) &&
      (!filters.location || listing.location === filters.location) &&
      (!filters.verified || listing.seller.isVerified)
    );
  });

  return filtered.sort((a, b) => {
    const pa = a.type === 'rent' ? a.rentalPrice.daily : a.price;
    const pb = b.type === 'rent' ? b.rentalPrice.daily : b.price;
    if (filters.sort === 'price_asc') return pa - pb;
    if (filters.sort === 'price_desc') return pb - pa;
    if (filters.sort === 'mileage_asc') return a.mileage - b.mileage;
    if (filters.sort === 'year_desc') return b.year - a.year;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

