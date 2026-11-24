import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

export interface BlockedUser {
  id: string;
  name: string;
  avatar?: string;
  blockedAt: string;
}

interface BlockedUsersContextValue {
  blocked: BlockedUser[];
  isBlocked: (id: string) => boolean;
  block: (user: Omit<BlockedUser, "blockedAt">) => void;
  unblock: (id: string) => void;
}

const seed: BlockedUser[] = [
  {
    id: "s3",
    name: "Yacine M.",
    avatar: "https://i.pravatar.cc/160?img=12",
    blockedAt: "2026-11-10T10:00:00.000Z",
  },
  { id: "u-spam", name: "Hamza R.", blockedAt: "2026-10-28T10:00:00.000Z" },
];

const BlockedUsersContext = createContext<BlockedUsersContextValue | null>(null);
const keyFor = (id: string) => `autohub:blocked:${id}`;

function load(userId: string): BlockedUser[] {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (raw) return JSON.parse(raw) as BlockedUser[];
  } catch {
    /* ignore */
  }
  // Never seed a user as blocking themselves.
  return seed.filter((item) => item.id !== userId);
}

/** Mock blocked-users store, shared with messaging in a later part. */
export function BlockedUsersProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [blocked, setBlocked] = useState<BlockedUser[]>(() => (user ? load(user.id) : []));
  useEffect(() => setBlocked(user ? load(user.id) : []), [user?.id]);

  const persist = useCallback(
    (next: BlockedUser[]) => {
      setBlocked(next);
      if (user)
        try {
          localStorage.setItem(keyFor(user.id), JSON.stringify(next));
        } catch {
          /* ignore */
        }
    },
    [user],
  );

  const value = useMemo<BlockedUsersContextValue>(
    () => ({
      blocked,
      isBlocked: (id) => blocked.some((item) => item.id === id),
      block: (entry) =>
        persist([
          ...blocked.filter((item) => item.id !== entry.id),
          { ...entry, blockedAt: new Date().toISOString() },
        ]),
      unblock: (id) => persist(blocked.filter((item) => item.id !== id)),
    }),
    [blocked, persist],
  );
  return <BlockedUsersContext.Provider value={value}>{children}</BlockedUsersContext.Provider>;
}

export function useBlockedUsers() {
  const context = useContext(BlockedUsersContext);
  if (!context) throw new Error("useBlockedUsers must be used inside BlockedUsersProvider");
  return context;
}
