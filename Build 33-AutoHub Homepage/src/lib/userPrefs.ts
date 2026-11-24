/** Mock per-user preferences persisted in localStorage. */
export interface NotificationPrefs {
  messages: boolean;
  verification: boolean;
  activity: boolean;
  savedSearches: boolean;
  news: boolean;
}

export interface PrivacyPrefs {
  showWilaya: boolean;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...(JSON.parse(raw) as T) } : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

const defaultsNotifications: NotificationPrefs = {
  messages: true,
  verification: true,
  activity: true,
  savedSearches: true,
  news: false,
};

export const readNotifications = (id: string) =>
  read(`autohub:notifications:${id}`, defaultsNotifications);
export const writeNotifications = (id: string, value: NotificationPrefs) =>
  write(`autohub:notifications:${id}`, value);
export const readPrivacy = (id: string) =>
  read<PrivacyPrefs>(`autohub:privacy:${id}`, { showWilaya: true });
export const writePrivacy = (id: string, value: PrivacyPrefs) =>
  write(`autohub:privacy:${id}`, value);
