import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { useGlobalToast } from "@/components/ui/toast";
import { seedFavorites } from "@/data/dashboardMock";

export interface FavoriteEntry {
  id: string;
  savedAt: string;
}

interface FavoritesContextValue {
  favorites: FavoriteEntry[];
  isFavorite: (id: string) => boolean;
  /** Toggles with a toast (or a log-in prompt when logged out). */
  toggleFavorite: (id: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);
const keyFor = (userId: string) => `autohub:favorites:${userId}`;

function load(userId: string): FavoriteEntry[] {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (raw) return JSON.parse(raw) as FavoriteEntry[];
  } catch {
    /* ignore */
  }
  return (seedFavorites[userId] ?? []).map((id, index) => ({
    id,
    savedAt: new Date(Date.now() - index * 26 * 3600000).toISOString(),
  }));
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { show } = useGlobalToast();
  const [favorites, setFavorites] = useState<FavoriteEntry[]>(() => (user ? load(user.id) : []));

  useEffect(() => setFavorites(user ? load(user.id) : []), [user?.id]);

  const persist = useCallback(
    (next: FavoriteEntry[]) => {
      setFavorites(next);
      if (!user) return;
      try {
        localStorage.setItem(keyFor(user.id), JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [user],
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      if (!user) {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        show({
          message: "Log in to save cars",
          actionLabel: "Log in",
          onAction: () => window.location.assign(`/login?redirect=${redirect}`),
        });
        return;
      }
      const existing = favorites.find((item) => item.id === id);
      if (existing) {
        const next = favorites.filter((item) => item.id !== id);
        persist(next);
        show({
          message: "Removed from favorites",
          actionLabel: "Undo",
          onAction: () => persist([...next, existing]),
        });
      } else {
        const next = [...favorites, { id, savedAt: new Date().toISOString() }];
        persist(next);
        show({
          message: "Saved to favorites",
          actionLabel: "Undo",
          onAction: () => persist(favorites),
        });
      }
    },
    [user, favorites, persist, show],
  );

  const value = useMemo(
    () => ({
      favorites,
      isFavorite: (id: string) => favorites.some((item) => item.id === id),
      toggleFavorite,
    }),
    [favorites, toggleFavorite],
  );
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used inside FavoritesProvider");
  return context;
}
