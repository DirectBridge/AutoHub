import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ListingTypeBadge } from "@/components/common/Badges";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Listing } from "@/data/mockListings";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { cn } from "@/lib/utils";

function useSwipe(onPrev: () => void, onNext: () => void) {
  const start = useRef<number | null>(null);
  return {
    onTouchStart: (event: React.TouchEvent) => (start.current = event.touches[0].clientX),
    onTouchEnd: (event: React.TouchEvent) => {
      if (start.current === null) return;
      const delta = event.changedTouches[0].clientX - start.current;
      if (Math.abs(delta) > 40) (delta > 0 ? onPrev : onNext)();
      start.current = null;
    },
  };
}

const arrowClass =
  "absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-primary shadow-card-hover hover:bg-muted-soft";

export function ListingGallery({ listing, inactive }: { listing: Listing; inactive: boolean }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const total = listing.images.length;
  const prev = () => setIndex((current) => (current - 1 + total) % total);
  const next = () => setIndex((current) => (current + 1) % total);
  const swipe = useSwipe(prev, next);
  const alt = (i: number) => `${listing.title}, photo ${i + 1} of ${total}`;

  return (
    <div>
      <div
        className="group relative -mx-4 aspect-[16/10] overflow-hidden bg-muted-soft sm:mx-0 sm:rounded-card"
        {...swipe}
      >
        <button
          className="size-full cursor-zoom-in"
          onClick={() => setLightbox(true)}
          aria-label={`Open ${alt(index)} in full screen`}
        >
          <img
            src={listing.images[index]}
            alt={alt(index)}
            className={cn("size-full object-cover", inactive && "grayscale")}
          />
        </button>
        <div className="absolute left-4 top-4">
          <ListingTypeBadge type={listing.type} />
        </div>
        <button
          aria-label="Previous photo"
          onClick={prev}
          className={cn(
            arrowClass,
            "left-4 opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          )}
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          aria-label="Next photo"
          onClick={next}
          className={cn(
            arrowClass,
            "right-4 opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          )}
        >
          <ChevronRight className="size-5" />
        </button>
        <span className="price absolute bottom-4 right-4 rounded-full bg-primary/80 px-2.5 py-1 text-xs font-medium text-white">
          {index + 1} / {total}
        </span>
      </div>

      <div className="mt-3 flex justify-center gap-1.5 sm:hidden" aria-hidden>
        {listing.images.map((_, i) => (
          <span
            key={i}
            className={cn("size-1.5 rounded-full bg-border", i === index && "w-4 bg-primary")}
          />
        ))}
      </div>

      <div className="horizontal-scroll mt-3 hidden gap-3 overflow-x-auto p-0.5 sm:flex">
        {listing.images.map((image, i) => (
          <button
            key={i}
            aria-label={`Show photo ${i + 1} of ${total}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={cn(
              "aspect-[16/10] w-[calc((100%-3rem)/5)] shrink-0 overflow-hidden rounded-button opacity-70 hover:opacity-100",
              i === index && "opacity-100 ring-2 ring-primary",
            )}
          >
            <img
              src={image}
              alt=""
              className={cn("size-full object-cover", inactive && "grayscale")}
            />
          </button>
        ))}
      </div>

      {lightbox && (
        <Lightbox
          listing={listing}
          index={index}
          onPrev={prev}
          onNext={next}
          alt={alt(index)}
          onClose={() => setLightbox(false)}
        />
      )}
    </div>
  );
}

function Lightbox({
  listing,
  index,
  alt,
  onPrev,
  onNext,
  onClose,
}: {
  listing: Listing;
  index: number;
  alt: string;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const ref = useFocusTrap<HTMLDivElement>(onClose);
  const swipe = useSwipe(onPrev, onNext);
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") onPrev();
        if (event.key === "ArrowRight") onNext();
      }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-primary/95 p-4"
      {...swipe}
    >
      <Button
        variant="ghost"
        size="icon"
        aria-label="Close photo viewer"
        onClick={onClose}
        className="absolute right-4 top-4 text-white hover:bg-white/10"
      >
        <X className="size-6" />
      </Button>
      <button
        aria-label="Previous photo"
        onClick={onPrev}
        className={cn(arrowClass, "left-4 hidden sm:flex")}
      >
        <ChevronLeft className="size-5" />
      </button>
      <img
        src={listing.images[index]}
        alt={alt}
        className="max-h-[82vh] max-w-full rounded-card object-contain"
      />
      <button
        aria-label="Next photo"
        onClick={onNext}
        className={cn(arrowClass, "right-4 hidden sm:flex")}
      >
        <ChevronRight className="size-5" />
      </button>
      <span
        aria-live="polite"
        className="price absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-medium text-white"
      >
        {index + 1} / {listing.images.length}
      </span>
    </div>
  );
}

export function ListingGallerySkeleton() {
  return (
    <div>
      <Skeleton className="-mx-4 aspect-[16/10] rounded-none sm:mx-0 sm:rounded-card" />
      <div className="mt-3 hidden gap-3 sm:flex">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="aspect-[16/10] flex-1 rounded-button" />
        ))}
      </div>
    </div>
  );
}
