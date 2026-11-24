import type { Listing } from "@/data/mockListings";

export type SearchSort = "newest" | "price_asc" | "price_desc" | "mileage_asc" | "year_desc";

export interface ListingFilters {
  q?: string;
  type?: "sale" | "rent";
  make?: string;
  model?: string;
  body: string[];
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  mileageMax?: number;
  fuel: string[];
  transmission: string[];
  color: string[];
  location?: string;
  verified: boolean;
  sort: SearchSort;
  view: "grid" | "list";
  page: number;
}

function numberParam(params: URLSearchParams, key: string) {
  const value = Number(params.get(key));
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

function listParam(params: URLSearchParams, key: string) {
  return (
    params
      .get(key)
      ?.split(",")
      .filter(Boolean)
      .map((value) => value.toLowerCase()) ?? []
  );
}

export function parseListingFilters(params: URLSearchParams): ListingFilters {
  const type = params.get("type");
  const sort = params.get("sort");
  return {
    q: params.get("q") || undefined,
    type: type === "sale" || type === "rent" ? type : undefined,
    make: params.get("make") || undefined,
    model: params.get("model") || undefined,
    body: listParam(params, "body"),
    priceMin: numberParam(params, "priceMin"),
    priceMax: numberParam(params, "priceMax"),
    yearMin: numberParam(params, "yearMin"),
    yearMax: numberParam(params, "yearMax"),
    mileageMax: numberParam(params, "mileageMax"),
    fuel: listParam(params, "fuel"),
    transmission: listParam(params, "transmission"),
    color: listParam(params, "color"),
    location: params.get("location") || undefined,
    verified: params.get("verified") === "true",
    sort:
      sort === "price_asc" ||
      sort === "price_desc" ||
      sort === "mileage_asc" ||
      sort === "year_desc"
        ? sort
        : "newest",
    view: params.get("view") === "list" ? "list" : "grid",
    page: Math.max(1, numberParam(params, "page") ?? 1),
  };
}

export function filterListings(listings: Listing[], filters: ListingFilters) {
  const query = filters.q?.toLowerCase().trim();
  const filtered = listings.filter((listing) => {
    const price = listing.type === "rent" ? listing.rentalPrice.daily : listing.price;
    return (
      listing.status === "active" &&
      (!filters.type || listing.type === filters.type) &&
      (!query ||
        `${listing.title} ${listing.make} ${listing.model}`.toLowerCase().includes(query)) &&
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
    if (filters.sort === "price_asc") return listingPrice(a) - listingPrice(b);
    if (filters.sort === "price_desc") return listingPrice(b) - listingPrice(a);
    if (filters.sort === "mileage_asc") return a.mileage - b.mileage;
    if (filters.sort === "year_desc") return b.year - a.year;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function listingPrice(listing: Listing) {
  return listing.type === "rent" ? listing.rentalPrice.daily : listing.price;
}
