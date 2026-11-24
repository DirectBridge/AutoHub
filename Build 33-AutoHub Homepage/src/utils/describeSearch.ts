import { formatNumber } from "@/lib/utils";
import { parseListingFilters } from "./filterListings";

const cap = (value: string) =>
  value === "suv" ? "SUV" : value.charAt(0).toUpperCase() + value.slice(1);

function shortPrice(value: number) {
  return value >= 1_000_000
    ? `${+(value / 1_000_000).toFixed(1)}M DA`
    : `${formatNumber(value)} DA`;
}

/** Read-only chip labels summarising a search query string. */
export function searchChips(query: string) {
  const filters = parseListingFilters(new URLSearchParams(query));
  const chips: string[] = [];
  if (filters.type) chips.push(filters.type === "sale" ? "For sale" : "For rent");
  if (filters.q) chips.push(`“${filters.q}”`);
  if (filters.make) chips.push(filters.model ? `${filters.make} ${filters.model}` : filters.make);
  filters.body.forEach((value) => chips.push(cap(value)));
  filters.fuel.forEach((value) => chips.push(cap(value)));
  filters.transmission.forEach((value) => chips.push(cap(value)));
  filters.color.forEach((value) => chips.push(cap(value)));
  if (filters.priceMin !== undefined) chips.push(`≥ ${formatNumber(filters.priceMin)} DA`);
  if (filters.priceMax !== undefined) chips.push(`≤ ${formatNumber(filters.priceMax)} DA`);
  if (filters.yearMin) chips.push(`From ${filters.yearMin}`);
  if (filters.yearMax) chips.push(`To ${filters.yearMax}`);
  if (filters.mileageMax !== undefined) chips.push(`≤ ${formatNumber(filters.mileageMax)} km`);
  if (filters.location) chips.push(filters.location);
  if (filters.verified) chips.push("Verified only");
  return chips;
}

/** Human name such as "Diesel SUVs under 4M DA in Constantine". */
export function autoSearchName(query: string) {
  const filters = parseListingFilters(new URLSearchParams(query));
  const fuel = filters.fuel.map(cap).join(" & ");
  const transmission = filters.transmission.length === 1 ? cap(filters.transmission[0]) : "";
  const body = filters.body.length === 1 ? `${cap(filters.body[0])}s` : (filters.make ?? "cars");
  const parts = [fuel || transmission, body].filter(Boolean);
  let name = parts.join(" ");
  if (filters.type === "rent") name += " for rent";
  if (filters.priceMax !== undefined)
    name += ` under ${filters.type === "rent" ? `${formatNumber(filters.priceMax)} DA/day` : shortPrice(filters.priceMax)}`;
  if (filters.location) name += ` in ${filters.location}`;
  name = name.trim();
  return name.charAt(0).toUpperCase() + name.slice(1) || "All cars";
}
