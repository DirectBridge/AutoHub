import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);
const keyFor = (userId) => `autohub:favorites:${userId}`;

function load(userId) {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState(() => (user ? load(user.id) : []));

  useEffect(() => setFavorites(user ? load(user.id) : []), [user?.id]);

  const persist = useCallback((next) => {
    setFavorites(next);
    if (!user) return;
    try { localStorage.setItem(keyFor(user.id), JSON.stringify(next)); } catch { /* ignore */ }
  }, [user]);

  const toggleFavorite = useCallback((id) => {
    if (!user) {
      alert('Log in to save cars');
      return;
    }
    const existing = favorites.find((item) => item.id === id);
    if (existing) {
      persist(favorites.filter((item) => item.id !== id));
    } else {
      persist([...favorites, { id, savedAt: new Date().toISOString() }]);
    }
  }, [user, favorites, persist]);

  const value = useMemo(() => ({
    favorites,
    isFavorite: (id) => favorites.some((item) => item.id === id),
    toggleFavorite,
  }), [favorites, toggleFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}

