import { useEffect } from "react";
import {
  Bookmark,
  Car,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/layout/Container";
import { Avatar } from "@/components/ui/avatar";
import { LinkButton } from "@/components/ui/button";
import { UnverifiedBadge, VerifiedBadge } from "@/components/common/Badges";
import { useGlobalToast } from "@/components/ui/toast";
import { useAuth, type UserRole } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useSavedSearches } from "@/context/SavedSearchesContext";
import { conversationsFor } from "@/data/dashboardMock";
import { cn } from "@/lib/utils";

export const dashboardRoleLabel: Record<UserRole, string> = {
  buyer: "Buyer",
  seller: "Seller",
  both: "Buyer & Seller",
  admin: "Admin",
};

export const isSellerRole = (role?: UserRole) =>
  role === "seller" || role === "both" || role === "admin";

const isActive = (path: string, href: string) =>
  path === href || (href !== "/dashboard" && path.startsWith(`${href}/`));

interface NavItem {
  label: string;
  href: string;
  icon: typeof Car;
  sellerOnly?: boolean;
  count?: number;
  badge?: number;
  dot?: "success" | "warning";
}

export function DashboardLayout({
  title,
  docTitle,
  subtitle,
  actions,
  children,
}: {
  title: string;
  /** Section name used in document.title, e.g. "My listings". */
  docTitle: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const { searches } = useSavedSearches();
  const { flash } = useGlobalToast();
  const path = window.location.pathname.replace(/\/$/, "");

  useEffect(() => {
    document.title = `${docTitle} · Dashboard · 33-AutoHub`;
  }, [docTitle]);

  if (!user) return null;
  const seller = isSellerRole(user.role);
  const unread = conversationsFor(user.role).filter((item) => item.unread).length;

  const items: NavItem[] = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "My listings", href: "/dashboard/listings", icon: Car, sellerOnly: true },
    { label: "Favorites", href: "/dashboard/favorites", icon: Heart, count: favorites.length },
    {
      label: "Saved searches",
      href: "/dashboard/searches",
      icon: Bookmark,
      count: searches.length,
    },
    { label: "Messages", href: "/messages", icon: MessageSquare, badge: unread },
    {
      label: "Verification",
      href: "/verification",
      icon: ShieldCheck,
      sellerOnly: true,
      dot: user.isVerified ? "success" : "warning",
    },
    { label: "Settings", href: "/settings", icon: Settings },
  ].filter((item) => seller || !item.sellerOnly) as NavItem[];

  const handleLogout = async () => {
    await logout();
    flash("You've been logged out");
    window.location.assign("/");
  };

  return (
    <>
      <Navbar />
      <Container className="py-6 lg:py-10">
        <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <Avatar
                  src={user.avatar}
                  name={`${user.firstName} ${user.lastName}`}
                  className="size-12"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-text-primary">
                    {user.firstName} {user.lastName}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center rounded-full bg-navy-soft px-2.5 py-1 text-xs font-medium text-primary">
                      {dashboardRoleLabel[user.role]}
                    </span>
                    {seller &&
                      (user.isVerified ? <VerifiedBadge compact /> : <UnverifiedBadge compact />)}
                  </div>
                </div>
              </div>

              <nav aria-label="Dashboard">
                <ul className="grid gap-1">
                  {items.map((item) => (
                    <li key={item.label}>
                      <SidebarLink item={item} active={isActive(path, item.href)} />
                    </li>
                  ))}
                </ul>
                <div className="my-3 border-t" />
                <button
                  onClick={handleLogout}
                  className="flex h-10 w-full items-center gap-3 rounded-button px-3 text-sm font-medium text-text-secondary hover:bg-muted-soft hover:text-primary"
                >
                  <LogOut className="size-5" strokeWidth={1.75} />
                  Log out
                </button>
              </nav>

              {seller ? (
                <LinkButton href="/sell" variant="accent" className="w-full">
                  <Plus className="size-4" />
                  Post a listing
                </LinkButton>
              ) : (
                <div className="rounded-card bg-accent-soft p-4">
                  <p className="text-sm font-semibold text-primary">Have a car to sell?</p>
                  <a
                    href="/settings/account"
                    className="mt-1 inline-block text-sm font-semibold text-accent-hover hover:underline"
                  >
                    Start selling →
                  </a>
                </div>
              )}
            </div>
          </aside>

          <main className="min-w-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-[2rem] font-bold leading-10 text-text-primary">{title}</h1>
                {subtitle && <p className="mt-1 text-base text-text-secondary">{subtitle}</p>}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>

            <nav
              aria-label="Dashboard"
              className="horizontal-scroll sticky top-[4.5rem] z-30 -mx-4 mt-5 flex gap-2 overflow-x-auto border-b bg-background/95 px-4 py-3 backdrop-blur-sm lg:hidden"
            >
              {items.map((item) => {
                const active = isActive(path, item.href);
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border bg-surface px-4 text-sm font-medium text-primary",
                      active && "border-primary bg-primary text-white",
                    )}
                  >
                    {item.label}
                    {(item.count ?? item.badge) ? (
                      <span
                        className={cn(
                          "price text-xs",
                          active ? "text-footer-text" : "text-text-secondary",
                        )}
                      >
                        {item.count ?? item.badge}
                      </span>
                    ) : null}
                  </a>
                );
              })}
            </nav>

            <div className="mt-6 lg:mt-8">{children}</div>
          </main>
        </div>
      </Container>
      <footer className="border-t py-6">
        <Container className="text-center text-xs text-text-secondary sm:text-left">
          © 2026 33-AutoHub. All rights reserved.
        </Container>
      </footer>
      {seller && (
        <a
          href="/sell"
          aria-label="Post a listing"
          className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-accent text-white shadow-float hover:bg-accent-hover lg:hidden"
        >
          <Plus className="size-6" />
        </a>
      )}
    </>
  );
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <a
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-10 items-center gap-3 rounded-button px-3 text-sm font-medium text-text-primary hover:bg-muted-soft",
        active && "bg-navy-soft text-primary hover:bg-navy-soft",
      )}
    >
      {active && (
        <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-accent" />
      )}
      <Icon
        className={cn("size-5", active ? "text-primary" : "text-secondary")}
        strokeWidth={1.75}
      />
      <span className="flex-1">{item.label}</span>
      {item.count !== undefined && item.count > 0 && (
        <span className="price text-xs text-text-secondary">{item.count}</span>
      )}
      {item.badge ? (
        <span className="price rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">
          {item.badge}
          <span className="sr-only"> unread</span>
        </span>
      ) : null}
      {item.dot && (
        <span
          className={cn(
            "size-2 rounded-full",
            item.dot === "success" ? "bg-success" : "bg-warning",
          )}
          aria-label={item.dot === "success" ? "Verified" : "Not verified"}
          role="img"
        />
      )}
    </a>
  );
}
