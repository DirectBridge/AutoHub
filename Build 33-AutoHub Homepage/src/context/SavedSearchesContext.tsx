import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { seedSavedSearches } from "@/data/dashboardMock";

export interface SavedSearch {
  id: string;
  name: string;
  /** URL query string without the leading "?". */
  params: string;
  createdAt: string;
  newMatches: number;
}

interface SavedSearchesContextValue {
  searches: SavedSearch[];
  saveSearch: (name: string, params: string) => SavedSearch;
  renameSearch: (id: string, name: string) => void;
  deleteSearch: (id: string) => void;
  markSeen: (id: string) => void;
}

const SavedSearchesContext = createContext<SavedSearchesContextValue | null>(null);
const keyFor = (userId: string) => `autohub:savedSearches:${userId}`;

function load(userId: string): SavedSearch[] {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (raw) return JSON.parse(raw) as SavedSearch[];
  } catch {
    /* ignore */
  }
  return (seedSavedSearches[userId] ?? []).map((item, index) => ({
    id: `seed-${index}`,
    name: item.name,
    params: item.params,
    newMatches: item.newMatches,
    createdAt: new Date(Date.now() - item.daysAgo * 86400000).toISOString(),
  }));
}

export function SavedSearchesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>(() => (user ? load(user.id) : []));
  useEffect(() => setSearches(user ? load(user.id) : []), [user?.id]);

  const persist = useCallback(
    (update: (current: SavedSearch[]) => SavedSearch[]) => {
      setSearches((current) => {
        const next = update(current);
        if (user)
          try {
            localStorage.setItem(keyFor(user.id), JSON.stringify(next));
          } catch {
            /* ignore */
          }
        return next;
      });
    },
    [user],
  );

  const value = useMemo<SavedSearchesContextValue>(
    () => ({
      searches,
      saveSearch: (name, params) => {
        const search = {
          id: `s-${Date.now()}`,
          name,
          params,
          createdAt: new Date().toISOString(),
          newMatches: 0,
        };
        persist((current) => [search, ...current]);
        return search;
      },
      renameSearch: (id, name) =>
        persist((current) => current.map((item) => (item.id === id ? { ...item, name } : item))),
      deleteSearch: (id) => persist((current) => current.filter((item) => item.id !== id)),
      markSeen: (id) =>
        persist((current) =>
          current.map((item) => (item.id === id ? { ...item, newMatches: 0 } : item)),
        ),
    }),
    [searches, persist],
  );
  return <SavedSearchesContext.Provider value={value}>{children}</SavedSearchesContext.Provider>;
}

export function useSavedSearches() {
  const context = useContext(SavedSearchesContext);
  if (!context) throw new Error("useSavedSearches must be used inside SavedSearchesProvider");
  return context;
}
