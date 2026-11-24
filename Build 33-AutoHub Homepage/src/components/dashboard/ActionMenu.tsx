import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ActionItem {
  label: string;
  icon?: typeof MoreHorizontal;
  href?: string;
  onSelect?: () => void;
  destructive?: boolean;
}

/** Keyboard-accessible "⋯" menu. Rendered with fixed positioning so table overflow never clips it. */
export function ActionMenu({ label, items }: { label: string; items: ActionItem[] }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !trigger.current) return;
    const rect = trigger.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    menu.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event.type === "scroll" || !menu.current?.contains(event.target as Node)) {
        if (event.target === trigger.current || trigger.current?.contains(event.target as Node))
          return;
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const entries = [...(menu.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [])];
    const index = entries.indexOf(document.activeElement as HTMLElement);
    if (event.key === "Escape" || event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      entries[(index + 1) % entries.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      entries[(index - 1 + entries.length) % entries.length]?.focus();
    }
  };

  const itemClass = (destructive?: boolean) =>
    cn(
      "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm hover:bg-muted-soft focus:bg-muted-soft focus:outline-none",
      destructive ? "text-danger" : "text-text-primary",
    );

  return (
    <>
      <Button
        ref={trigger}
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(!open);
        }}
      >
        <MoreHorizontal className="size-5" />
      </Button>
      {open && (
        <div
          ref={menu}
          role="menu"
          aria-label={label}
          onKeyDown={onKeyDown}
          onClick={(event) => event.stopPropagation()}
          style={{ top: position.top, right: position.right }}
          className="fixed z-50 w-52 rounded-card border bg-surface p-1.5 shadow-card-hover"
        >
          {items.map(({ label: itemLabel, icon: Icon, href, onSelect, destructive }) =>
            href ? (
              <a
                key={itemLabel}
                role="menuitem"
                tabIndex={-1}
                href={href}
                className={itemClass(destructive)}
              >
                {Icon && <Icon className="size-4 text-secondary" />}
                {itemLabel}
              </a>
            ) : (
              <button
                key={itemLabel}
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  setOpen(false);
                  trigger.current?.focus();
                  onSelect?.();
                }}
                className={itemClass(destructive)}
              >
                {Icon && (
                  <Icon className={cn("size-4", destructive ? "text-danger" : "text-secondary")} />
                )}
                {itemLabel}
              </button>
            ),
          )}
        </div>
      )}
    </>
  );
}
