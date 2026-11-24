import { useEffect, useRef, useState } from "react";
import { Flag, Link2, Mail, MessageCircle, MoreHorizontal, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareMenu({
  title,
  onCopied,
  onReport,
  mobile = false,
}: {
  title: string;
  onCopied: () => void;
  onReport?: () => void;
  mobile?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const url = window.location.origin + window.location.pathname;
  const text = encodeURIComponent(`${title} on 33-AutoHub`);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) =>
      !root.current?.contains(event.target as Node) && setOpen(false);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item =
    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-text-primary hover:bg-muted-soft";

  return (
    <div ref={root} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={mobile ? "More actions" : "Share"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {mobile ? <MoreHorizontal className="size-5" /> : <Share2 className="size-5" />}
      </Button>
      {open && (
        <div className="absolute right-0 top-12 z-30 w-56 rounded-card border bg-surface p-2 shadow-card-hover">
          <p className="px-3 pb-1 pt-1.5 text-xs font-medium text-text-secondary">Share</p>
          <button
            className={item}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
              } catch {
                /* Clipboard may be unavailable in embedded previews. */
              }
              setOpen(false);
              onCopied();
            }}
          >
            <Link2 className="size-4 text-secondary" />
            Copy link
          </button>
          <a
            className={item}
            href={`https://wa.me/?text=${text}%20${encodeURIComponent(url)}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="size-4 text-secondary" />
            WhatsApp
          </a>
          <a
            className={item}
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noreferrer"
          >
            <Users className="size-4 text-secondary" />
            Facebook
          </a>
          <a className={item} href={`mailto:?subject=${text}&body=${encodeURIComponent(url)}`}>
            <Mail className="size-4 text-secondary" />
            Email
          </a>
          {onReport && (
            <>
              <div className="my-1 border-t" />
              <button
                className={item}
                onClick={() => {
                  setOpen(false);
                  onReport();
                }}
              >
                <Flag className="size-4 text-secondary" />
                Report listing
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
