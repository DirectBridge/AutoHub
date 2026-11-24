import { useEffect, useState } from "react";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { conversationsFor } from "@/data/dashboardMock";
import { cn } from "@/lib/utils";

export function useSimulatedLoading(ms = 500) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(timer);
  }, [ms]);
  return loading;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-card border bg-surface shadow-card", className)}>
      {children}
    </section>
  );
}

export function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      {action}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: typeof ArrowRight;
  label: string;
  value: string;
  trend?: number;
}) {
  return (
    <div className="rounded-card border bg-surface p-4 shadow-card sm:p-5">
      <span className="flex size-10 items-center justify-center rounded-full bg-navy-soft text-primary">
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <p className="mt-4 text-sm text-text-secondary">{label}</p>
      <p className="price mt-1 text-[1.75rem] font-bold leading-9 text-text-primary">{value}</p>
      {trend !== undefined && (
        <p
          className={cn(
            "mt-1 flex items-center gap-1 text-xs font-medium",
            trend >= 0 ? "text-success" : "text-danger",
          )}
        >
          {trend >= 0 ? (
            <TrendingUp aria-hidden className="size-3.5" />
          ) : (
            <TrendingDown aria-hidden className="size-3.5" />
          )}
          {trend >= 0 ? "+" : "−"}
          {Math.abs(trend)}% vs last 30 days
        </p>
      )}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-card border bg-surface p-4 shadow-card sm:p-5">
      <Skeleton className="size-10 rounded-full" />
      <Skeleton className="mt-4 h-4 w-24" />
      <Skeleton className="mt-2 h-8 w-20" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  );
}

export function ViewAllLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-hover hover:underline"
    >
      {children} <ArrowRight className="size-4" />
    </a>
  );
}

export function RecentMessages({ role, loading }: { role: string; loading?: boolean }) {
  const conversations = conversationsFor(role);
  return (
    <Card>
      <CardHeader
        title="Recent messages"
        action={<ViewAllLink href="/messages">View all messages</ViewAllLink>}
      />
      <ul className="divide-y">
        {loading
          ? Array.from({ length: 5 }, (_, index) => (
              <li key={index} className="flex items-center gap-3 px-5 py-3.5">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </li>
            ))
          : conversations.map((conversation) => (
              <li
                key={conversation.id}
                className="relative flex items-center gap-3 px-5 py-3.5 hover:bg-background"
              >
                {/* Row link to the conversation; seller avatar/name sit above it and link to the profile. */}
                <a
                  href="/messages"
                  className="absolute inset-0"
                  aria-label={`Open conversation with ${conversation.name}${conversation.unread ? " (unread)" : ""}`}
                />
                {conversation.sellerId ? (
                  <a
                    href={`/seller/${conversation.sellerId}`}
                    className="relative z-10 shrink-0"
                    aria-label={`${conversation.name} profile`}
                  >
                    <Avatar src={conversation.avatar} name={conversation.name} />
                  </a>
                ) : (
                  <Avatar src={conversation.avatar} name={conversation.name} />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p
                      className={cn(
                        "truncate text-sm text-text-primary",
                        conversation.unread ? "font-semibold" : "font-medium",
                      )}
                    >
                      {conversation.sellerId ? (
                        <a
                          href={`/seller/${conversation.sellerId}`}
                          className="relative z-10 hover:text-accent hover:underline"
                        >
                          {conversation.name}
                        </a>
                      ) : (
                        conversation.name
                      )}
                    </p>
                    <span className="shrink-0 text-xs text-text-secondary">
                      {conversation.time}
                    </span>
                  </div>
                  <p className="truncate text-xs text-text-secondary">
                    {conversation.listing?.title}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 truncate text-sm",
                      conversation.unread ? "text-text-primary" : "text-text-secondary",
                    )}
                  >
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.unread ? (
                  <span
                    className="size-2.5 shrink-0 rounded-full bg-accent"
                    role="img"
                    aria-label="Unread"
                  />
                ) : (
                  <span className="size-2.5 shrink-0" aria-hidden />
                )}
              </li>
            ))}
      </ul>
    </Card>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: typeof ArrowRight;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-card border bg-surface px-6 py-14 text-center shadow-card">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted-soft text-primary">
        <Icon className="size-7" strokeWidth={1.5} />
      </span>
      <h3 className="mt-5 text-xl font-semibold leading-7">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function NewBadgeCount({ count }: { count: number }) {
  return (
    <span className="price inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">
      +{count} new
    </span>
  );
}
