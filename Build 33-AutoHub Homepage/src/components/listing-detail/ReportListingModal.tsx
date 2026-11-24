import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const listingReasons = [
  "Scam or fraud",
  "Wrong information",
  "Car already sold",
  "Offensive content",
  "Duplicate listing",
  "Other",
];

export function ReportListingModal({
  onClose,
  onSubmitted,
  title = "Report this listing",
  reasons = listingReasons,
}: {
  onClose: () => void;
  onSubmitted: () => void;
  title?: string;
  reasons?: string[];
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <Dialog label={title} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setLoading(true);
          window.setTimeout(onSubmitted, 700);
        }}
      >
        <div className="p-6">
          <h2 className="pr-10 text-xl font-semibold leading-7">{title}</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Reports are confidential. Tell us what's wrong.
          </p>
          <fieldset className="mt-5 grid gap-1">
            <legend className="sr-only">Reason</legend>
            {reasons.map((item) => (
              <label
                key={item}
                className="flex cursor-pointer items-center gap-3 rounded-button px-3 py-2.5 text-sm text-text-primary hover:bg-muted-soft"
              >
                <input
                  type="radio"
                  name="reason"
                  value={item}
                  checked={reason === item}
                  onChange={() => setReason(item)}
                  className="size-4 accent-accent"
                />
                {item}
              </label>
            ))}
          </fieldset>
          <label className="mt-4 grid gap-1.5 text-sm font-medium text-primary">
            Details (optional)
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Add anything that helps our team review this listing"
              className="w-full resize-none rounded-button border bg-surface p-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t p-5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="destructive" disabled={!reason} loading={loading}>
            Submit report
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
