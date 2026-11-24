import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  mockListings,
  removeListing,
  restoreListing,
  updateListingStatus,
  type Listing,
  type ListingStatus,
} from "@/data/mockListings";

interface ListingsContextValue {
  listings: Listing[];
  getListing: (id: string) => Listing | undefined;
  setStatus: (id: string, status: ListingStatus) => void;
  deleteListing: (id: string) => void;
  restore: (id: string) => void;
}

const ListingsContext = createContext<ListingsContextValue | null>(null);

/** Thin reactive wrapper over the mock listing store so status changes re-render everywhere. */
export function ListingsProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(0);
  const bump = () => setVersion((value) => value + 1);

  const setStatus = useCallback((id: string, status: ListingStatus) => {
    updateListingStatus(id, status);
    bump();
  }, []);
  const deleteListing = useCallback((id: string) => {
    removeListing(id);
    bump();
  }, []);
  const restore = useCallback((id: string) => {
    restoreListing(id);
    bump();
  }, []);

  const value = useMemo<ListingsContextValue>(
    () => ({
      // New array identity on every change so memoised consumers recompute.
      listings: [...mockListings],
      getListing: (id) => mockListings.find((item) => item.id === id),
      setStatus,
      deleteListing,
      restore,
    }),
    [version, setStatus, deleteListing, restore],
  );
  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
}

export function useListings() {
  const context = useContext(ListingsContext);
  if (!context) throw new Error("useListings must be used inside ListingsProvider");
  return context;
}
