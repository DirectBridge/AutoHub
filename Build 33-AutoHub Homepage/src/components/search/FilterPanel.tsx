import { useId, useState } from "react";
import { Bookmark, Car, CarFront, Check, ChevronDown, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { mockListings } from "@/data/mockListings";
import { cn, formatNumber } from "@/lib/utils";
import { parseListingFilters } from "@/utils/filterListings";
import { SaveSearchDialog } from "./SaveSearchDialog";

interface FilterPanelProps {
  params: URLSearchParams;
  onParam: (key: string, value?: string) => void;
  onClear: () => void;
  resultCount: number;
  loggedIn?: boolean;
}

const bodyTypes = [
  ["sedan", Car],
  ["suv", CarFront],
  ["hatchback", Car],
  ["coupe", CarFront],
  ["truck", Truck],
  ["van", Truck],
  ["convertible", Car],
] as const;

const colors = [
  ["White", "bg-surface"],
  ["Black", "bg-text-primary"],
  ["Gray", "bg-muted"],
  ["Silver", "bg-secondary"],
  ["Blue", "bg-rent"],
  ["Red", "bg-danger"],
  ["Beige", "bg-warning-soft"],
  ["Green", "bg-success"],
] as const;

export function FilterPanel({
  params,
  onParam,
  onClear,
  resultCount,
  loggedIn = false,
}: FilterPanelProps) {
  const filters = parseListingFilters(params);
  const id = useId();
  const [toast, setToast] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const priceLimit = filters.type === "rent" ? 20000 : 10000000;
  const priceStep = filters.type === "rent" ? 500 : 50000;
  const minPrice = Math.min(filters.priceMin ?? 0, filters.priceMax ?? priceLimit);
  const maxPrice = Math.max(filters.priceMax ?? priceLimit, minPrice);
  const makes = [...new Set(mockListings.map((item) => item.make))].sort();
  const models = [
    ...new Set(
      mockListings
        .filter((item) => !filters.make || item.make === filters.make)
        .map((item) => item.model),
    ),
  ].sort();
  const locations = [...new Set(mockListings.map((item) => item.location))].sort();
  const hasFilters = [...params.keys()].some(
    (key) => !["sort", "view", "page", "auth", "error"].includes(key),
  );

  const toggleList = (key: string, value: string) => {
    const current = params.get(key)?.split(",").filter(Boolean) ?? [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onParam(key, next.length ? next.join(",") : undefined);
  };

  const countFor = (key: "fuelType" | "transmission", value: string) =>
    mockListings.filter(
      (item) =>
        item.status === "active" &&
        (!filters.type || item.type === filters.type) &&
        item[key] === value,
    ).length;

  return (
    <div className="rounded-card border bg-surface shadow-card">
      <div className="flex items-center justify-between p-5">
        <h2 className="text-xl font-semibold">Filters</h2>
        <button
          className="text-sm font-semibold text-accent hover:text-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onClear}
          disabled={!hasFilters}
        >
          Clear all
        </button>
      </div>

      <FilterGroup title="Listing type">
        <Tabs
          className="grid w-full grid-cols-2"
          items={[
            { value: "sale", label: "Buy" },
            { value: "rent", label: "Rent" },
          ]}
          value={filters.type ?? "sale"}
          onChange={(value) => onParam("type", value)}
        />
      </FilterGroup>

      <FilterGroup title="Price">
        <p className="mb-1 text-sm font-semibold text-primary">
          {formatNumber(minPrice)} DA – {formatNumber(maxPrice)} DA
        </p>
        {filters.type === "rent" && <p className="mb-3 text-xs text-text-secondary">per day</p>}
        <DualRange
          min={minPrice}
          max={maxPrice}
          limit={priceLimit}
          step={priceStep}
          onMin={(value) => onParam("priceMin", value)}
          onMax={(value) => onParam("priceMax", value)}
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Input
            label="Min"
            type="number"
            min={0}
            max={priceLimit}
            step={priceStep}
            value={filters.priceMin ?? ""}
            placeholder="0"
            onChange={(event) => onParam("priceMin", event.target.value || undefined)}
          />
          <Input
            label="Max"
            type="number"
            min={0}
            max={priceLimit}
            step={priceStep}
            value={filters.priceMax ?? ""}
            placeholder={formatNumber(priceLimit)}
            onChange={(event) => onParam("priceMax", event.target.value || undefined)}
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Make & model">
        <div className="grid gap-3">
          <Input
            label="Make"
            list={`${id}-makes`}
            value={filters.make ?? ""}
            placeholder="Search makes"
            onChange={(event) => {
              onParam("model");
              onParam("make", event.target.value || undefined);
            }}
          />
          <datalist id={`${id}-makes`}>
            {makes.map((make) => (
              <option key={make} value={make} />
            ))}
          </datalist>
          <Input
            label="Model"
            list={`${id}-models`}
            value={filters.model ?? ""}
            placeholder="Search models"
            disabled={!filters.make}
            onChange={(event) => onParam("model", event.target.value || undefined)}
          />
          <datalist id={`${id}-models`}>
            {models.map((model) => (
              <option key={model} value={model} />
            ))}
          </datalist>
        </div>
      </FilterGroup>

      <FilterGroup title="Year">
        <div className="grid grid-cols-2 gap-2">
          <NativeSelect
            label="From"
            value={filters.yearMin ?? ""}
            onChange={(value) => onParam("yearMin", value)}
          />
          <NativeSelect
            label="To"
            value={filters.yearMax ?? ""}
            onChange={(value) => onParam("yearMax", value)}
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Mileage">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-primary">Max mileage</span>
          <button
            className="text-xs font-semibold text-accent"
            onClick={() => onParam("mileageMax")}
          >
            Any
          </button>
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          {filters.mileageMax === undefined ? "Any" : `${formatNumber(filters.mileageMax)} km`}
        </p>
        <input
          type="range"
          min={0}
          max={300000}
          step={5000}
          value={filters.mileageMax ?? 300000}
          aria-label="Maximum mileage"
          aria-valuetext={
            filters.mileageMax === undefined
              ? "Any mileage"
              : `${formatNumber(filters.mileageMax)} kilometers`
          }
          onChange={(event) =>
            onParam("mileageMax", event.target.value === "300000" ? undefined : event.target.value)
          }
          className="mt-3 w-full accent-accent"
        />
      </FilterGroup>

      <FilterGroup title="Body type">
        <div className="grid grid-cols-2 gap-2">
          {bodyTypes.map(([body, Icon]) => {
            const selected = filters.body.includes(body);
            return (
              <button
                key={body}
                aria-pressed={selected}
                onClick={() => toggleList("body", body)}
                className={cn(
                  "flex items-center gap-2 rounded-button border p-2.5 text-left text-xs font-medium capitalize text-primary hover:border-accent",
                  selected && "border-accent bg-accent-soft text-accent-hover",
                )}
              >
                <Icon className="size-5" strokeWidth={1.5} />
                {body}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Fuel type">
        {(["petrol", "diesel", "electric", "hybrid"] as const).map((fuel) => (
          <CheckRow
            key={fuel}
            label={`${capitalize(fuel)} (${countFor("fuelType", fuel)})`}
            checked={filters.fuel.includes(fuel)}
            onChange={() => toggleList("fuel", fuel)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Transmission">
        {(["manual", "automatic"] as const).map((transmission) => (
          <CheckRow
            key={transmission}
            label={`${capitalize(transmission)} (${countFor("transmission", transmission)})`}
            checked={filters.transmission.includes(transmission)}
            onChange={() => toggleList("transmission", transmission)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Color">
        <div className="flex flex-wrap gap-2">
          {colors.map(([color, swatch]) => {
            const selected = filters.color.includes(color.toLowerCase());
            return (
              <button
                key={color}
                type="button"
                title={color}
                aria-label={`${selected ? "Remove" : "Select"} ${color}`}
                aria-pressed={selected}
                onClick={() => toggleList("color", color.toLowerCase())}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border-2 border-surface ring-1 ring-border",
                  swatch,
                  selected && "ring-2 ring-accent ring-offset-2",
                )}
              >
                {selected && (
                  <Check
                    className={cn(
                      "size-4",
                      color === "White" || color === "Beige" ? "text-primary" : "text-white",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Location">
        <Input
          label="Wilaya"
          list={`${id}-locations`}
          value={filters.location ?? ""}
          placeholder="Search wilayas"
          onChange={(event) => onParam("location", event.target.value || undefined)}
        />
        <datalist id={`${id}-locations`}>
          {locations.map((location) => (
            <option key={location} value={location} />
          ))}
        </datalist>
      </FilterGroup>

      <FilterGroup title="Trust">
        <label className="flex items-center justify-between gap-3 text-sm font-medium text-primary">
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-success" />
            Verified sellers only
          </span>
          <input
            type="checkbox"
            className="peer sr-only"
            checked={filters.verified}
            onChange={(event) => onParam("verified", event.target.checked ? "true" : undefined)}
          />
          <span className="relative h-6 w-11 shrink-0 rounded-full bg-secondary peer-checked:bg-accent after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
        </label>
      </FilterGroup>

      <div className="border-t p-5">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            if (loggedIn) {
              setSaveOpen(true);
              return;
            }
            setToast(true);
            window.setTimeout(() => setToast(false), 3500);
          }}
        >
          <Bookmark className="size-4" />
          Save this search
        </Button>
        <p className="mt-2 text-center text-xs text-text-secondary">{resultCount} matching cars</p>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[70] max-w-sm rounded-card border bg-surface p-4 text-sm shadow-card-hover"
        >
          <p className="font-medium text-primary">Log in to save searches</p>
          {
            <a
              href={`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
              className="mt-2 inline-block font-semibold text-accent hover:text-accent-hover"
            >
              Log in
            </a>
          }
        </div>
      )}
      {saveOpen && <SaveSearchDialog params={params} onClose={() => setSaveOpen(false)} />}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <fieldset className="border-t px-5 py-4">
      <legend className="w-full">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="flex w-full items-center justify-between py-1 text-sm font-semibold text-primary"
        >
          {title}
          <ChevronDown className={cn("size-4 transition", !open && "-rotate-90")} />
        </button>
      </legend>
      {open && <div className="mt-3">{children}</div>}
    </fieldset>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm text-text-primary">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 rounded border-border accent-accent"
      />
      {label}
    </label>
  );
}

function DualRange({
  min,
  max,
  limit,
  step,
  onMin,
  onMax,
}: {
  min: number;
  max: number;
  limit: number;
  step: number;
  onMin: (value: string) => void;
  onMax: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="relative h-8">
      <div className="absolute inset-x-0 top-3.5 h-1 rounded-full bg-border" />
      <div
        className="absolute top-3.5 h-1 rounded-full bg-accent"
        style={{ left: `${(min / limit) * 100}%`, right: `${100 - (max / limit) * 100}%` }}
      />
      <label className="sr-only" htmlFor={`${id}-min`}>
        Minimum price
      </label>
      <input
        id={`${id}-min`}
        type="range"
        min={0}
        max={limit}
        step={step}
        value={min}
        aria-valuetext={`${formatNumber(min)} DA`}
        onChange={(event) => onMin(String(Math.min(Number(event.target.value), max)))}
        className="dual-range-input"
      />
      <label className="sr-only" htmlFor={`${id}-max`}>
        Maximum price
      </label>
      <input
        id={`${id}-max`}
        type="range"
        min={0}
        max={limit}
        step={step}
        value={max}
        aria-valuetext={`${formatNumber(max)} DA`}
        onChange={(event) => onMax(String(Math.max(Number(event.target.value), min)))}
        className="dual-range-input"
      />
    </div>
  );
}

function NativeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | string;
  onChange: (value?: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-primary">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value || undefined)}
        className="h-11 rounded-button border bg-surface px-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      >
        <option value="">Any</option>
        {Array.from({ length: 17 }, (_, index) => 2026 - index).map((year) => (
          <option key={year}>{year}</option>
        ))}
      </select>
    </label>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
