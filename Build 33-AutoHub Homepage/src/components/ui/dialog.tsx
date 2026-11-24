import { X } from "lucide-react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function Dialog({
  label,
  onClose,
  children,
  className,
  hideClose = false,
}: {
  label: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  hideClose?: boolean;
}) {
  const ref = useFocusTrap<HTMLDivElement>(onClose);
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-primary/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          "relative max-h-[92vh] w-full max-w-[32.5rem] overflow-y-auto rounded-t-modal bg-surface shadow-float sm:rounded-modal",
          className,
        )}
      >
        {!hideClose && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 z-10"
          >
            <X className="size-5" />
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  destructive = false,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog label={title} onClose={onClose} hideClose className="max-w-[26rem]">
      <div className="p-6">
        <h2 className="text-xl font-semibold leading-7 text-text-primary">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={destructive ? "destructive" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
