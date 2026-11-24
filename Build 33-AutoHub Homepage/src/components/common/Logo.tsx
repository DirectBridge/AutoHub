import { cn } from "@/lib/utils";

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <a
      href="/"
      aria-label="33-AutoHub home"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <svg aria-hidden viewBox="0 0 40 40" className="size-9">
        <rect width="40" height="40" rx="12" className={light ? "fill-white" : "fill-primary"} />
        <path
          d="M10 15.5h8.5l-5.5 5h5.5v5H10M22 15.5h8l-5 5h5v5h-8"
          fill="none"
          className={light ? "stroke-primary" : "stroke-white"}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx="31" cy="10" r="3" className="fill-accent" />
      </svg>
      <span
        className={cn("font-display text-lg tracking-tight", light ? "text-white" : "text-primary")}
      >
        33-AutoHub
      </span>
    </a>
  );
}
