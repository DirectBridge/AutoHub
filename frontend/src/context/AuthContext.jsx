import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const SESSION_KEY = 'autohub:session';
const OVERRIDES_KEY = 'autohub:accountOverrides';
const ACCOUNTS_KEY = 'autohub:accounts';
const DELAY = 800;

const demoAccounts = [
  { id: 'u-buyer', firstName: 'Nadia', lastName: 'Benali', email: 'buyer@autohub.dz', phone: '550 12 34 56', role: 'buyer', isVerified: false, verificationStatus: 'unverified', createdAt: '2024-03-12T10:00:00.000Z', password: 'Password123', emailConfirmed: true },
  { id: 's1', firstName: 'Karim', lastName: 'Bensalem', email: 'seller@autohub.dz', phone: '661 23 45 67', avatar: 'https://i.pravatar.cc/160?img=11', role: 'seller', isVerified: true, verificationStatus: 'verified', createdAt: '2021-04-12T10:00:00.000Z', password: 'Password123', emailConfirmed: true },
  { id: 's3', firstName: 'Yacine', lastName: 'Mansouri', email: 'newseller@autohub.dz', phone: '770 98 76 54', avatar: 'https://i.pravatar.cc/160?img=12', role: 'seller', isVerified: false, verificationStatus: 'unverified', createdAt: '2025-01-17T10:00:00.000Z', password: 'Password123', emailConfirmed: true },
  { id: 'u-pending', firstName: 'Sara', lastName: 'Haddad', email: 'unconfirmed@autohub.dz', role: 'buyer', isVerified: false, verificationStatus: 'unverified', createdAt: new Date().toISOString(), password: 'Password123', emailConfirmed: false },
];

const googleUser = { id: 'u-google', firstName: 'Karim', lastName: 'Ait Ali', email: 'karim.google@gmail.com', role: 'buyer', isVerified: false, verificationStatus: 'unverified', createdAt: new Date().toISOString(), googleConnected: true };

function read(storage, key) {
  try { const raw = storage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function write(storage, key, value) {
  try { if (value === null) storage.removeItem(key); else storage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}
const wait = () => new Promise((resolve) => window.setTimeout(resolve, DELAY));

function readOverrides() { return read(localStorage, OVERRIDES_KEY) ?? {}; }
function writeOverride(id, patch) {
  const all = readOverrides();
  write(localStorage, OVERRIDES_KEY, { ...all, [id]: { ...all[id], ...patch } });
}

export function getProfileOverrides(id) {
  const { password: _p, emailConfirmed: _c, deleted: _d, ...rest } = readOverrides()[id] ?? {};
  return rest;
}

function accounts() {
  const registered = read(localStorage, ACCOUNTS_KEY) ?? [];
  const overrides = readOverrides();
  return [...demoAccounts, ...registered]
    .filter((a) => !overrides[a.id]?.deleted)
    .map((a) => { const { deleted: _d, ...override } = overrides[a.id] ?? {}; return { ...a, ...override }; });
}

function toUser({ password: _p, emailConfirmed: _c, ...user }) { return user; }

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => read(localStorage, SESSION_KEY) ?? read(sessionStorage, SESSION_KEY));
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const startSession = useCallback((next, remember = true) => {
    write(remember ? localStorage : sessionStorage, SESSION_KEY, next);
    write(remember ? sessionStorage : localStorage, SESSION_KEY, null);
    setUser(next);
    return next;
  }, []);

  const run = useCallback(async (task) => {
    setIsLoading(true);
    try { await wait(); return await task(); } finally { setIsLoading(false); }
  }, []);

  const updateProfile = useCallback(async (patch, options) => {
    if (!user) throw new Error('You need to be logged in.');
    const apply = () => {
      const next = { ...user, ...patch };
      if (patch.verificationStatus) next.isVerified = patch.verificationStatus === 'verified';
      writeOverride(user.id, { ...patch, isVerified: next.isVerified });
      const storage = read(localStorage, SESSION_KEY) ? localStorage : sessionStorage;
      write(storage, SESSION_KEY, next);
      setUser(next);
      return next;
    };
    return options?.instant ? apply() : run(apply);
  }, [user, run]);

  const changePassword = useCallback((currentPassword, newPassword) => run(() => {
    if (!user) throw new Error('You need to be logged in.');
    const stored = accounts().find((a) => a.id === user.id)?.password;
    if (stored !== undefined && stored !== currentPassword) throw new Error('Your current password is incorrect.');
    writeOverride(user.id, { password: newPassword });
  }), [user, run]);

  const changeEmail = useCallback((newEmail, currentPassword) => run(() => {
    if (!user) throw new Error('You need to be logged in.');
    const stored = accounts().find((a) => a.id === user.id)?.password;
    if (stored !== undefined && stored !== currentPassword) throw new Error('Your current password is incorrect.');
    const email = newEmail.trim().toLowerCase();
    if (accounts().some((a) => a.email.toLowerCase() === email && a.id !== user.id)) throw new Error('An account with this email already exists.');
  }), [user, run]);

  const deleteAccount = useCallback(() => run(() => {
    if (user) writeOverride(user.id, { deleted: true });
    write(localStorage, SESSION_KEY, null);
    write(sessionStorage, SESSION_KEY, null);
    setUser(null);
  }), [user, run]);

  const value = useMemo(() => ({
    user, isLoading,
    login: (email, password, remember = true) => run(() => {
      if (failedAttempts >= 5) throw new Error('Too many attempts. Try again in a few minutes.');
      const account = accounts().find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
      if (!account || account.password !== password) { setFailedAttempts((c) => c + 1); throw new Error('Incorrect email or password.'); }
      if (!account.emailConfirmed) throw new Error('Please confirm your email first.');
      setFailedAttempts(0);
      return startSession(toUser(account), remember);
    }),
    register: (data) => run(() => {
      const email = data.email.trim().toLowerCase();
      if (accounts().some((a) => a.email.toLowerCase() === email)) throw new Error('An account with this email already exists.');
      const registered = read(localStorage, ACCOUNTS_KEY) ?? [];
      write(localStorage, ACCOUNTS_KEY, [...registered, { id: `u-${Date.now()}`, firstName: data.firstName.trim(), lastName: data.lastName.trim(), email, phone: data.phone || undefined, role: data.role, isVerified: false, verificationStatus: 'unverified', createdAt: new Date().toISOString(), password: data.password, emailConfirmed: false }]);
      return { email };
    }),
    loginWithGoogle: () => run(() => startSession(googleUser)),
    logout: async () => { write(localStorage, SESSION_KEY, null); write(sessionStorage, SESSION_KEY, null); setUser(null); },
    requestPasswordReset: () => run(() => undefined),
    resetPassword: (newPassword) => run(() => { if (newPassword.length < 8) throw new Error("Your password doesn't meet the requirements."); }),
    resendConfirmation: () => run(() => undefined),
    updateProfile, changePassword, changeEmail, deleteAccount,
    confirmEmail: (email) => run(() => {
      const registered = read(localStorage, ACCOUNTS_KEY) ?? [];
      const match = registered.find((a) => a.email === email.toLowerCase());
      if (match) { match.emailConfirmed = true; write(localStorage, ACCOUNTS_KEY, registered); return startSession(toUser(match)); }
      const demo = accounts().find((a) => a.email === email.toLowerCase());
      return startSession(toUser(demo ?? demoAccounts[1]));
    }),
  }), [user, isLoading, failedAttempts, run, startSession, updateProfile, changePassword, changeEmail, deleteAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function safeRedirect(value, fallback = '/dashboard') {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : fallback;
}

export const roleLabel = { buyer: 'Buyer', seller: 'Seller', both: 'Buyer & seller', admin: 'Admin' };

