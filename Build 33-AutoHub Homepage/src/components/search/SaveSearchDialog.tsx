import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGlobalToast } from "@/components/ui/toast";
import { useSavedSearches } from "@/context/SavedSearchesContext";
import { autoSearchName, searchChips } from "@/utils/describeSearch";

export function SaveSearchDialog({
  params,
  onClose,
}: {
  params: URLSearchParams;
  onClose: () => void;
}) {
  const saved = new URLSearchParams(params);
  ["page", "view", "error", "auth"].forEach((key) => saved.delete(key));
  const query = saved.toString();
  const [name, setName] = useState(() => autoSearchName(query));
  const { saveSearch } = useSavedSearches();
  const { show } = useGlobalToast();
  const chips = searchChips(query);

  return (
    <Dialog label="Name this search" onClose={onClose} className="max-w-[28rem]">
      <form
        className="p-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          saveSearch(name.trim(), query);
          onClose();
          show({
            message: "Search saved. We'll keep it in your dashboard.",
            actionLabel: "View saved searches",
            onAction: () => window.location.assign("/dashboard/searches"),
          });
        }}
      >
        <h2 className="pr-10 text-xl font-semibold leading-7">Name this search</h2>
        <p className="mt-1 text-sm text-text-secondary">
          We'll show new matches in your dashboard.
        </p>
        <div className="mt-5">
          <Input
            label="Search name"
            value={name}
            maxLength={80}
            autoFocus
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-muted-soft px-2.5 py-1 text-xs font-medium text-primary"
              >
                {chip}
              </span>
            ))}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            Save
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
