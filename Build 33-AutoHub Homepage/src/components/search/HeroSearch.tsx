import { useState } from "react";
import { Search } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const tabs = [
  { value: "buy", label: "Buy" },
  { value: "rent", label: "Rent" },
] as const;
const popular = ["SUV under 4M DA", "Automatic", "Diesel", "Electric"];

export function HeroSearch() {
  const [mode, setMode] = useState<"buy" | "rent">("buy");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [body, setBody] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const search = () => {
    const params = new URLSearchParams({ type: mode === "buy" ? "sale" : "rent" });
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (body) params.set("body", body);
    if (priceMax) params.set("priceMax", priceMax);
    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <div className="rounded-modal bg-surface p-4 shadow-float md:p-5">
      <Tabs
        items={tabs}
        value={mode}
        onChange={(value) => {
          setMode(value);
          setPriceMax("");
        }}
      />
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
        <Select
          label="Make"
          hideLabel
          value={make}
          onChange={(event) => setMake(event.target.value)}
        >
          <option value="">All makes</option>
          <option>Volkswagen</option>
          <option>Hyundai</option>
          <option>Renault</option>
          <option>Toyota</option>
          <option>Kia</option>
        </Select>
        <Select
          label="Model"
          hideLabel
          disabled={!make}
          value={model}
          onChange={(event) => setModel(event.target.value)}
        >
          <option value="">All models</option>
          {make === "Volkswagen" && <option>Golf 8</option>}
          {make === "Hyundai" && <option>Tucson</option>}
          {make === "Renault" && <option>Clio 5</option>}
          {make === "Toyota" && <option>Hilux</option>}
          {make === "Kia" && <option>Sportage</option>}
        </Select>
        <Select
          label="Body type"
          hideLabel
          value={body}
          onChange={(event) => setBody(event.target.value)}
        >
          <option value="">Body type</option>
          <option value="suv">SUV</option>
          <option value="sedan">Sedan</option>
          <option value="hatchback">Hatchback</option>
          <option value="truck">Truck</option>
        </Select>
        <Select
          label={mode === "rent" ? "Max price per day" : "Max price"}
          hideLabel
          value={priceMax}
          onChange={(event) => setPriceMax(event.target.value)}
        >
          <option value="">{mode === "rent" ? "Max price / day" : "Max price"}</option>
          {mode === "rent" ? (
            <>
              <option value="5000">5 000 DA</option>
              <option value="10000">10 000 DA</option>
              <option value="15000">15 000 DA</option>
            </>
          ) : (
            <>
              <option value="2000000">2 000 000 DA</option>
              <option value="4000000">4 000 000 DA</option>
              <option value="8000000">8 000 000 DA</option>
            </>
          )}
        </Select>
        <Button variant="accent" size="lg" className="w-full lg:w-auto" onClick={search}>
          <Search className="size-5" />
          Search
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-text-secondary">Popular:</span>
        {popular.map((item) => {
          const href = {
            "SUV under 4M DA": "/search?body=suv&priceMax=4000000",
            Automatic: "/search?transmission=automatic",
            Diesel: "/search?fuel=diesel",
            Electric: "/search?fuel=electric",
          }[item];
          return (
            <a
              href={href}
              key={item}
              className="rounded-full border px-3 py-1.5 text-xs font-medium text-primary hover:border-accent hover:text-accent"
            >
              {item}
            </a>
          );
        })}
      </div>
    </div>
  );
}
