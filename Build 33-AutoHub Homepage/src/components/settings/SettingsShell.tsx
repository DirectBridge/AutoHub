import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Bell, Lock, ShieldOff, User } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const settingsTabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & blocked users", icon: ShieldOff },
] as const;
export type SettingsTab = (typeof settingsTabs)[number]["id"];

const DirtyContext = createContext<(key: string, dirty: boolean) => void>(() => undefined);

/** Registers a section's unsaved state with the settings page's leave guard. */
export function useDirtyGuard(key: string, dirty: boolean) {
  const register = useContext(DirtyContext);
  useEffect(() => {
    register(key, dirty);
    return () => register(key, false);
  }, [key, dirty, register]);
}

export function SettingsShell({ tab, children }: { tab: SettingsTab; children: React.ReactNode }) {
  const [dirtyKeys, setDirtyKeys] = useState<string[]>([]);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const dirty = dirtyKeys.length > 0;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  const register = useCallback((key: string, value: boolean) => {
    setDirtyKeys((current) =>
      value ? [...new Set([...current, key])] : current.filter((item) => item !== key),
    );
  }, []);

  useEffect(() => {
    // Intercept same-origin link clicks anywhere on the page while there are unsaved changes.
    const onClick = (event: MouseEvent) => {
      if (
        !dirtyRef.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey
      )
        return;
      const anchor = (event.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank") return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname)
        return;
      event.preventDefault();
      setPendingHref(url.pathname + url.search);
    };
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  const current = settingsTabs.find((item) => item.id === tab)!;

  return (
    <DashboardLayout
      docTitle={`${current.label} · Settings`}
      title="Settings"
      subtitle="Manage your profile, account and preferences."
    >
      <DirtyContext.Provider value={register}>
        <div className="lg:grid lg:grid-cols-[12.5rem_minmax(0,1fr)] lg:gap-8">
          <nav aria-label="Settings sections" className="mb-6 lg:mb-0">
            <ul className="horizontal-scroll -mx-4 flex gap-2 overflow-x-auto px-4 lg:sticky lg:top-24 lg:mx-0 lg:grid lg:gap-1 lg:overflow-visible lg:px-0">
              {settingsTabs.map(({ id, label, icon: Icon }) => {
                const active = id === tab;
                return (
                  <li key={id} className="shrink-0">
                    <a
                      href={`/settings/${id}`}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-9 items-center gap-2 rounded-full border bg-surface px-4 text-sm font-medium text-primary lg:h-10 lg:rounded-button lg:border-0 lg:bg-transparent lg:px-3 lg:hover:bg-muted-soft",
                        active &&
                          "border-primary bg-primary text-white lg:bg-navy-soft lg:text-primary lg:hover:bg-navy-soft",
                      )}
                    >
                      <Icon aria-hidden className="hidden size-4 lg:block" strokeWidth={1.75} />
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="grid min-w-0 gap-6">{children}</div>
        </div>
      </DirtyContext.Provider>
      {pendingHref && (
        <ConfirmDialog
          title="Discard changes?"
          description="You have unsaved changes. If you leave now, they'll be lost."
          confirmLabel="Discard"
          destructive
          onClose={() => setPendingHref(null)}
          onConfirm={() => {
            dirtyRef.current = false;
            window.location.assign(pendingHref);
          }}
        />
      )}
    </DashboardLayout>
  );
}

export function SettingsCard({
  title,
  description,
  children,
  formId,
  dirty,
  saving,
  onCancel,
  className,
  titleClassName,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  /** When set, renders the Cancel / Save footer bound to this form id. */
  formId?: string;
  dirty?: boolean;
  saving?: boolean;
  onCancel?: () => void;
  className?: string;
  titleClassName?: string;
}) {
  const headingId = useMemo(() => `${title.replace(/\W+/g, "-").toLowerCase()}-title`, [title]);
  return (
    <section
      aria-labelledby={headingId}
      className={cn("rounded-card border bg-surface shadow-card", className)}
    >
      <div className="p-5 sm:p-6">
        <h2
          id={headingId}
          className={cn("text-xl font-semibold leading-7 text-text-primary", titleClassName)}
        >
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
        <div className="mt-5">{children}</div>
      </div>
      {formId && (
        <div className="flex justify-end gap-2 border-t px-5 py-4 sm:px-6">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={!dirty || saving}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={!dirty} loading={saving}>
            Save changes
          </Button>
        </div>
      )}
    </section>
  );
}
