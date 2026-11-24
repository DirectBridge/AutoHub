import { useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button, LinkButton } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { UnverifiedBadge, VerifiedBadge } from "@/components/common/Badges";
import type { Listing } from "@/data/mockListings";
import { cn, formatNumber } from "@/lib/utils";

const maxLength = 1000;

export function ContactSellerModal({
  listing,
  loggedIn,
  onClose,
}: {
  listing: Listing;
  loggedIn: boolean;
  onClose: () => void;
}) {
  const greeting = `Hello, I'm interested in your ${listing.title}.`;
  const [message, setMessage] = useState(`${greeting} Is it still available?`);
  const [state, setState] = useState<"form" | "sending" | "sent">("form");
  const chips = [
    "Is it still available?",
    "Is the price negotiable?",
    "Can I see it this week?",
    ...(listing.type === "rent" ? ["Is it available on my dates?"] : []),
  ];
  const price =
    listing.type === "rent"
      ? `${formatNumber(listing.rentalPrice.daily)} DA / day`
      : `${formatNumber(listing.price)} DA`;

  const returnTo = encodeURIComponent(`/listing/${listing.id}?contact=1`);

  const send = () => {
    setState("sending");
    window.setTimeout(() => setState("sent"), 900);
  };

  return (
    <Dialog label={`Contact seller about ${listing.title}`} onClose={onClose}>
      <div className="flex items-center gap-3 border-b p-5 pr-14">
        <img
          src={listing.images[0]}
          alt=""
          className="size-16 shrink-0 rounded-button object-cover"
        />
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-text-primary">{listing.title}</h2>
          <p className="price mt-0.5 text-sm font-bold text-primary">{price}</p>
        </div>
      </div>

      {state === "sent" ? (
        <div className="px-6 py-10 text-center" role="status">
          <CheckCircle2 className="mx-auto size-12 text-success" strokeWidth={1.75} />
          <h3 className="mt-4 text-xl font-semibold">Message sent!</h3>
          <p className="mt-2 text-sm text-text-secondary">
            {listing.seller.name} usually replies within a few hours.
          </p>
          <LinkButton href="/messages" variant="primary" className="mt-6">
            Go to messages
          </LinkButton>
        </div>
      ) : !loggedIn ? (
        <div className="px-6 py-10 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted-soft text-primary">
            <Lock className="size-6" />
          </span>
          <h3 className="mt-4 text-xl font-semibold">Log in to contact the seller</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Messages stay private and protected inside 33-AutoHub.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <LinkButton href={`/login?redirect=${returnTo}`} variant="primary">
              Log in
            </LinkButton>
            <LinkButton href={`/register?redirect=${returnTo}`} variant="secondary">
              Create account
            </LinkButton>
          </div>
        </div>
      ) : (
        <>
          <div className="p-5">
            <div className="flex items-center gap-2.5 text-sm font-medium text-text-primary">
              <Avatar src={listing.seller.avatar} name={listing.seller.name} size="sm" />
              {listing.seller.name}
              {listing.seller.isVerified ? <VerifiedBadge /> : <UnverifiedBadge />}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setMessage(`${greeting} ${chip}`)}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium text-primary hover:border-accent hover:text-accent"
                >
                  {chip}
                </button>
              ))}
            </div>
            <label className="mt-5 grid gap-1.5 text-sm font-medium text-primary">
              Your message
              <textarea
                value={message}
                maxLength={maxLength}
                rows={5}
                onChange={(event) => setMessage(event.target.value)}
                className="w-full resize-none rounded-button border bg-surface p-3 text-sm leading-6 text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </label>
            <p
              className={cn(
                "price mt-1.5 text-right text-xs text-text-secondary",
                message.length >= maxLength && "text-danger",
              )}
            >
              {message.length} / {maxLength}
            </p>
          </div>
          <div className="flex justify-end gap-2 border-t p-5">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="accent"
              loading={state === "sending"}
              disabled={!message.trim()}
              onClick={send}
            >
              Send message
            </Button>
          </div>
        </>
      )}
    </Dialog>
  );
}
