import { ArrowRight } from "lucide-react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  link,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  link?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-bold leading-8 text-text-primary md:text-[2rem] md:leading-10">
          {title}
        </h2>
        {description && <p className="mt-2 max-w-2xl text-text-secondary">{description}</p>}
      </div>
      {link && (
        <a
          href={link}
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-accent hover:text-accent-hover md:flex"
        >
          View all <ArrowRight aria-hidden className="size-4" />
        </a>
      )}
    </div>
  );
}
