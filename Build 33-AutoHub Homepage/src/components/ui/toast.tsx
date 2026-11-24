import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export interface ToastState {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<number>(undefined);
  const show = useCallback((next: ToastState) => {
    window.clearTimeout(timer.current);
    setToast(next);
    timer.current = window.setTimeout(() => setToast(null), 5000);
  }, []);
  const dismiss = useCallback(() => setToast(null), []);
  return { toast, show, dismiss };
}

export function Toast({ toast, onDismiss }: { toast: ToastState | null; onDismiss: () => void }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex justify-center px-4 lg:bottom-6"
    >
      {toast && (
        <div
          role="status"
          className="pointer-events-auto flex max-w-md items-center gap-4 rounded-card bg-primary px-4 py-3 text-sm font-medium text-white shadow-card-hover"
        >
          <span>{toast.message}</span>
          {toast.actionLabel && (
            <button
              className="shrink-0 font-semibold text-accent-soft underline-offset-4 hover:underline"
              onClick={() => {
                toast.onAction?.();
                onDismiss();
              }}
            >
              {toast.actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const FLASH_KEY = "autohub:flash";
const ToastContext = createContext<{
  show: (toast: ToastState) => void;
  /** Shows a toast after the next full page navigation. */
  flash: (message: string) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toast, show, dismiss } = useToast();

  useEffect(() => {
    try {
      const message = sessionStorage.getItem(FLASH_KEY);
      if (message) {
        sessionStorage.removeItem(FLASH_KEY);
        show({ message });
      }
    } catch {
      /* ignore */
    }
  }, [show]);

  const flash = useCallback((message: string) => {
    try {
      sessionStorage.setItem(FLASH_KEY, message);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <ToastContext.Provider value={{ show, flash }}>
      {children}
      <Toast toast={toast} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useGlobalToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useGlobalToast must be used inside ToastProvider");
  return context;
}
