import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { mockListings, removeListing, restoreListing, updateListingStatus } from '../data/mockListings';

const ListingsContext = createContext(null);

export function ListingsProvider({ children }) {
  const [version, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);

  const setStatus = useCallback((id, status) => { updateListingStatus(id, status); bump(); }, []);
  const deleteListing = useCallback((id) => { removeListing(id); bump(); }, []);
  const restore = useCallback((id) => { restoreListing(id); bump(); }, []);

  const value = useMemo(() => ({
    listings: [...mockListings],
    getListing: (id) => mockListings.find((item) => item.id === id),
    setStatus, deleteListing, restore,
  }), [version, setStatus, deleteListing, restore]);

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
}

export function useListings() {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error('useListings must be used inside ListingsProvider');
  return ctx;
}

