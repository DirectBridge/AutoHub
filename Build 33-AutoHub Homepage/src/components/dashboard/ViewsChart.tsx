import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";
import type { Listing } from "@/data/mockListings";
import { Card } from "./DashboardWidgets";

type Point = { date: string; label: string; views: number };

export function ViewsChart({
  history,
  topListings,
  loading,
}: {
  history: Point[];
  topListings: Listing[];
  loading?: boolean;
}) {
  const [range, setRange] = useState<"7d" | "30d">("30d");
  const data = range === "7d" ? history.slice(-7) : history;
  const first = data[0]?.views ?? 0;
  const last = data[data.length - 1]?.views ?? 0;
  const days = range === "7d" ? 7 : 30;
  const summary = `Views ${last >= first ? "increased" : "decreased"} from ${first} to ${last} per day over the last ${days} days.`;

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Listing views, last {days} days
          </h2>
          <p className="mt-0.5 text-sm text-text-secondary">
            <span className="price font-semibold text-text-primary">
              {formatNumber(data.reduce((sum, point) => sum + point.views, 0))}
            </span>{" "}
            total views · {last} today
          </p>
        </div>
        <Tabs
          items={[
            { value: "7d", label: "7d" },
            { value: "30d", label: "30d" },
          ]}
          value={range}
          onChange={setRange}
        />
      </div>
      <div className="px-2 pt-5 sm:px-4">
        <p className="sr-only" aria-live="polite">
          {summary}
        </p>
        {loading ? (
          <Skeleton className="mx-3 h-60" />
        ) : (
          <div aria-hidden className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={28}
                />
                <YAxis
                  tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip
                  cursor={{ stroke: "var(--color-secondary)", strokeDasharray: "3 3" }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="rounded-button border bg-surface px-3 py-2 text-xs shadow-card-hover">
                        <p className="text-text-secondary">{(payload[0].payload as Point).label}</p>
                        <p className="price mt-0.5 font-semibold text-text-primary">
                          {payload[0].value} views
                        </p>
                      </div>
                    ) : null
                  }
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  fill="var(--color-accent)"
                  fillOpacity={0.1}
                  activeDot={{
                    r: 4,
                    fill: "var(--color-accent)",
                    stroke: "var(--color-surface)",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mt-4 border-t px-5 py-4">
        <h3 className="text-sm font-semibold text-text-primary">Top listings</h3>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-text-secondary">
              <th scope="col" className="py-2 font-medium">
                Listing
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Views
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Inquiries
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {topListings.map((listing) => (
              <tr key={listing.id}>
                <td className="py-2.5">
                  <a
                    href={`/listing/${listing.id}`}
                    className="flex min-w-0 items-center gap-3 hover:text-accent"
                  >
                    <img
                      src={listing.images[0]}
                      alt=""
                      className="h-9 w-12 shrink-0 rounded-md object-cover"
                    />
                    <span className="truncate font-medium">{listing.title}</span>
                  </a>
                </td>
                <td className="price py-2.5 text-right">{formatNumber(listing.views)}</td>
                <td className="price py-2.5 text-right">{listing.inquiries}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
