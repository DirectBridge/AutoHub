import { useEffect, useRef, useState } from "react";
import { Bookmark, Pencil, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ActionMenu } from "@/components/dashboard/ActionMenu";
import {
  EmptyState,
  NewBadgeCount,
  useSimulatedLoading,
} from "@/components/dashboard/DashboardWidgets";
import { Button, LinkButton } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useGlobalToast } from "@/components/ui/toast";
import { useSavedSearches, type SavedSearch } from "@/context/SavedSearchesContext";
import { searchChips } from "@/utils/describeSearch";

const savedDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(iso),
  );

export function SavedSearchesPage() {
  const { searches, deleteSearch } = useSavedSearches();
  const { show } = useGlobalToast();
  const loading = useSimulatedLoading();
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<SavedSearch | null>(null);

  return (
    <DashboardLayout
      docTitle="Saved searches"
      title="Saved searches"
      subtitle="Quickly re-run searches you care about."
    >
      {loading ? (
        <div className="grid gap-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex gap-4 rounded-card border bg-surface p-5 shadow-card">
              <Skeleton className="size-11 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : searches.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved searches"
          text="Save a search from the results page to find it here."
          action={
            <LinkButton href="/search" variant="primary">
              Start searching
            </LinkButton>
          }
        />
      ) : (
        <ul className="grid gap-4">
          {searches.map((search) => (
            <SavedSearchCard
              key={search.id}
              search={search}
              editing={editing === search.id}
              onEdit={(value) => setEditing(value ? search.id : null)}
              onDelete={() => setDeleting(search)}
            />
          ))}
        </ul>
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete this saved search?"
          description={`"${deleting.name}" will be removed from your dashboard.`}
          confirmLabel="Delete"
          destructive
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            deleteSearch(deleting.id);
            setDeleting(null);
            show({ message: "Saved search deleted." });
          }}
        />
      )}
    </DashboardLayout>
  );
}

function SavedSearchCard({
  search,
  editing,
  onEdit,
  onDelete,
}: {
  search: SavedSearch;
  editing: boolean;
  onEdit: (editing: boolean) => void;
  onDelete: () => void;
}) {
  const { renameSearch, markSeen } = useSavedSearches();
  const [draft, setDraft] = useState(search.name);
  const input = useRef<HTMLInputElement>(null);
  const pencil = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(search.name);
      input.current?.focus();
      input.current?.select();
    }
  }, [editing]);

  const finish = (save: boolean) => {
    if (save && draft.trim()) renameSearch(search.id, draft.trim());
    onEdit(false);
    window.setTimeout(() => pencil.current?.focus(), 0);
  };

  return (
    <li className="flex flex-col gap-4 rounded-card border bg-surface p-5 shadow-card md:flex-row md:items-center">
      <div className="flex min-w-0 flex-1 gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy-soft text-primary">
          <Bookmark className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              ref={input}
              aria-label="Search name"
              value={draft}
              maxLength={80}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") finish(true);
                if (event.key === "Escape") finish(false);
              }}
              onBlur={() => finish(true)}
              className="h-9 w-full max-w-md rounded-button border bg-surface px-3 text-base font-semibold text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          ) : (
            <div className="flex items-center gap-1">
              <h3 className="truncate text-xl font-semibold leading-7 text-text-primary">
                {search.name}
              </h3>
              <Button
                ref={pencil}
                variant="ghost"
                size="icon-sm"
                aria-label={`Rename ${search.name}`}
                onClick={() => onEdit(true)}
              >
                <Pencil className="size-4 text-secondary" />
              </Button>
            </div>
          )}
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Filters">
            {searchChips(search.params).map((chip) => (
              <li
                key={chip}
                className="rounded-full bg-muted-soft px-2.5 py-1 text-xs font-medium text-primary"
              >
                {chip}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-text-secondary">Saved {savedDate(search.createdAt)}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 md:justify-end">
        {search.newMatches > 0 && <NewBadgeCount count={search.newMatches} />}
        <Button
          variant="accent"
          onClick={() => {
            markSeen(search.id);
            window.setTimeout(() => window.location.assign(`/search?${search.params}`), 50);
          }}
        >
          View results
        </Button>
        <ActionMenu
          label={`Actions for ${search.name}`}
          items={[
            { label: "Rename", icon: Pencil, onSelect: () => onEdit(true) },
            { label: "Delete", icon: Trash2, destructive: true, onSelect: onDelete },
          ]}
        />
      </div>
    </li>
  );
}
