import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type UserRole = "buyer" | "seller" | "both" | "admin";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  createdAt: string;
  wilaya?: string;
  commune?: string;
  about?: string;
  googleConnected?: boolean;
  verificationSubmittedAt?: string;
}

export type ProfilePatch = Partial<
  Pick<
    AuthUser,
    | "firstName"
    | "lastName"
    | "phone"
    | "avatar"
    | "wilaya"
    | "commune"
    | "about"
    | "role"
    | "verificationStatus"
    | "googleConnected"
    | "verificationSubmittedAt"
  >
>;

export interface RegisterData {
  role: Exclude<UserRole, "admin">;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

/** Error shape used by the UI. A Supabase adapter can map its error codes onto these. */
export class AuthError extends Error {
  constructor(
    public code:
      | "invalid_credentials"
      | "email_not_confirmed"
      | "rate_limited"
      | "email_taken"
      | "unknown",
    message: string,
  ) {
    super(message);
  }
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<AuthUser>;
  register: (data: RegisterData) => Promise<{ email: string }>;
  loginWithGoogle: () => Promise<AuthUser>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  confirmEmail: (email: string) => Promise<AuthUser>;
  /** Persists profile/account changes. `instant` skips the simulated delay (dev toggles). */
  updateProfile: (patch: ProfilePatch, options?: { instant?: boolean }) => Promise<AuthUser>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  /** Starts an email change; resolves once the confirmation email is "sent". */
  changeEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

interface StoredAccount extends AuthUser {
  password: string;
  emailConfirmed: boolean;
}

const SESSION_KEY = "autohub:session";
const OVERRIDES_KEY = "autohub:accountOverrides";
const ACCOUNTS_KEY = "autohub:accounts";
const DELAY = 800;

const demoAccounts: StoredAccount[] = [
  {
    id: "u-buyer",
    firstName: "Nadia",
    lastName: "Benali",
    email: "buyer@autohub.dz",
    phone: "550 12 34 56",
    role: "buyer",
    isVerified: false,
    verificationStatus: "unverified",
    createdAt: "2024-03-12T10:00:00.000Z",
    password: "Password123",
    emailConfirmed: true,
  },
  {
    // Matches seller "s1" (Karim B.) in mockListings so owner view activates automatically.
    id: "s1",
    firstName: "Karim",
    lastName: "Bensalem",
    email: "seller@autohub.dz",
    phone: "661 23 45 67",
    avatar: "https://i.pravatar.cc/160?img=11",
    role: "seller",
    isVerified: true,
    verificationStatus: "verified",
    createdAt: "2021-04-12T10:00:00.000Z",
    password: "Password123",
    emailConfirmed: true,
  },
  {
    // Matches unverified seller "s3" (Yacine M.).
    id: "s3",
    firstName: "Yacine",
    lastName: "Mansouri",
    email: "newseller@autohub.dz",
    phone: "770 98 76 54",
    avatar: "https://i.pravatar.cc/160?img=12",
    role: "seller",
    isVerified: false,
    verificationStatus: "unverified",
    createdAt: "2025-01-17T10:00:00.000Z",
    password: "Password123",
    emailConfirmed: true,
  },
  {
    id: "u-pending",
    firstName: "Sara",
    lastName: "Haddad",
    email: "unconfirmed@autohub.dz",
    role: "buyer",
    isVerified: false,
    verificationStatus: "unverified",
    createdAt: new Date().toISOString(),
    password: "Password123",
    emailConfirmed: false,
  },
];

const googleUser: AuthUser = {
  id: "u-google",
  firstName: "Karim",
  lastName: "Ait Ali",
  email: "karim.google@gmail.com",
  role: "buyer",
  isVerified: false,
  verificationStatus: "unverified",
  createdAt: new Date().toISOString(),
  googleConnected: true,
};

type AccountOverride = Partial<StoredAccount> & { deleted?: boolean };

function read<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(storage: Storage, key: string, value: unknown) {
  try {
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, JSON.stringify(value));
  } catch {
    /* Storage can be unavailable (private mode, embedded previews). */
  }
}

const wait = () => new Promise((resolve) => window.setTimeout(resolve, DELAY));

function readOverrides() {
  return read<Record<string, AccountOverride>>(localStorage, OVERRIDES_KEY) ?? {};
}

function writeOverride(id: string, patch: AccountOverride) {
  const all = readOverrides();
  write(localStorage, OVERRIDES_KEY, { ...all, [id]: { ...all[id], ...patch } });
}

/** Public-profile fields a user edited in settings (read by /seller/:id). */
export function getProfileOverrides(id: string): Partial<AuthUser> {
  const {
    password: _password,
    emailConfirmed: _confirmed,
    deleted: _deleted,
    ...rest
  } = readOverrides()[id] ?? {};
  return rest;
}

function accounts(): StoredAccount[] {
  const registered = read<StoredAccount[]>(localStorage, ACCOUNTS_KEY) ?? [];
  const overrides = readOverrides();
  return [...demoAccounts, ...registered]
    .filter((account) => !overrides[account.id]?.deleted)
    .map((account) => {
      const { deleted: _deleted, ...override } = overrides[account.id] ?? {};
      return { ...account, ...override };
    });
}

function toUser({
  password: _password,
  emailConfirmed: _confirmed,
  ...user
}: StoredAccount): AuthUser {
  return user;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(
    () => read<AuthUser>(localStorage, SESSION_KEY) ?? read<AuthUser>(sessionStorage, SESSION_KEY),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const startSession = useCallback((next: AuthUser, remember = true) => {
    write(remember ? localStorage : sessionStorage, SESSION_KEY, next);
    write(remember ? sessionStorage : localStorage, SESSION_KEY, null);
    setUser(next);
    return next;
  }, []);

  const run = useCallback(async <T,>(task: () => T | Promise<T>) => {
    setIsLoading(true);
    try {
      await wait();
      return await task();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (patch: ProfilePatch, options?: { instant?: boolean }) => {
      if (!user) throw new AuthError("unknown", "You need to be logged in.");
      const apply = () => {
        const next: AuthUser = { ...user, ...patch };
        if (patch.verificationStatus) next.isVerified = patch.verificationStatus === "verified";
        writeOverride(user.id, { ...patch, isVerified: next.isVerified });
        const storage = read<AuthUser>(localStorage, SESSION_KEY) ? localStorage : sessionStorage;
        write(storage, SESSION_KEY, next);
        setUser(next);
        return next;
      };
      return options?.instant ? apply() : run(apply);
    },
    [user, run],
  );

  const passwordFor = (id: string) => accounts().find((item) => item.id === id)?.password;

  const changePassword = useCallback(
    (currentPassword: string, newPassword: string) =>
      run(() => {
        if (!user) throw new AuthError("unknown", "You need to be logged in.");
        const stored = passwordFor(user.id);
        if (stored !== undefined && stored !== currentPassword)
          throw new AuthError("invalid_credentials", "Your current password is incorrect.");
        writeOverride(user.id, { password: newPassword });
      }),
    [user, run],
  );

  const changeEmail = useCallback(
    (newEmail: string, currentPassword: string) =>
      run(() => {
        if (!user) throw new AuthError("unknown", "You need to be logged in.");
        const stored = passwordFor(user.id);
        if (stored !== undefined && stored !== currentPassword)
          throw new AuthError("invalid_credentials", "Your current password is incorrect.");
        const email = newEmail.trim().toLowerCase();
        if (accounts().some((item) => item.email.toLowerCase() === email && item.id !== user.id))
          throw new AuthError("email_taken", "An account with this email already exists.");
      }),
    [user, run],
  );

  const deleteAccount = useCallback(
    () =>
      run(() => {
        if (user) writeOverride(user.id, { deleted: true });
        write(localStorage, SESSION_KEY, null);
        write(sessionStorage, SESSION_KEY, null);
        setUser(null);
      }),
    [user, run],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: (email, password, remember = true) =>
        run(() => {
          if (failedAttempts >= 5)
            throw new AuthError("rate_limited", "Too many attempts. Try again in a few minutes.");
          const account = accounts().find(
            (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
          );
          if (!account || account.password !== password) {
            setFailedAttempts((count) => count + 1);
            throw new AuthError("invalid_credentials", "Incorrect email or password.");
          }
          if (!account.emailConfirmed)
            throw new AuthError("email_not_confirmed", "Please confirm your email first.");
          setFailedAttempts(0);
          return startSession(toUser(account), remember);
        }),
      register: (data) =>
        run(() => {
          const email = data.email.trim().toLowerCase();
          if (accounts().some((item) => item.email.toLowerCase() === email))
            throw new AuthError("email_taken", "An account with this email already exists.");
          const registered = read<StoredAccount[]>(localStorage, ACCOUNTS_KEY) ?? [];
          write(localStorage, ACCOUNTS_KEY, [
            ...registered,
            {
              id: `u-${Date.now()}`,
              firstName: data.firstName.trim(),
              lastName: data.lastName.trim(),
              email,
              phone: data.phone || undefined,
              role: data.role,
              isVerified: false,
              verificationStatus: "unverified",
              createdAt: new Date().toISOString(),
              password: data.password,
              emailConfirmed: false,
            } satisfies StoredAccount,
          ]);
          return { email };
        }),
      loginWithGoogle: () => run(() => startSession(googleUser)),
      logout: async () => {
        write(localStorage, SESSION_KEY, null);
        write(sessionStorage, SESSION_KEY, null);
        setUser(null);
      },
      requestPasswordReset: () => run(() => undefined),
      resetPassword: (newPassword) =>
        run(() => {
          if (newPassword.length < 8)
            throw new AuthError("unknown", "Your password doesn't meet the requirements.");
        }),
      resendConfirmation: () => run(() => undefined),
      updateProfile,
      changePassword,
      changeEmail,
      deleteAccount,
      confirmEmail: (email) =>
        run(() => {
          const registered = read<StoredAccount[]>(localStorage, ACCOUNTS_KEY) ?? [];
          const match = registered.find((item) => item.email === email.toLowerCase());
          if (match) {
            match.emailConfirmed = true;
            write(localStorage, ACCOUNTS_KEY, registered);
            return startSession(toUser(match));
          }
          const demo = accounts().find((item) => item.email === email.toLowerCase());
          return startSession(toUser(demo ?? demoAccounts[1]));
        }),
    }),
    [
      user,
      isLoading,
      failedAttempts,
      run,
      startSession,
      updateProfile,
      changePassword,
      changeEmail,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

/** Only allow same-origin relative redirects. */
export function safeRedirect(value: string | null, fallback = "/dashboard") {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export const roleLabel: Record<UserRole, string> = {
  buyer: "Buyer",
  seller: "Seller",
  both: "Buyer & seller",
  admin: "Admin",
};
