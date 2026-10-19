export interface UserProfile {
  name: string;
  email: string;
  photoURL?: string;
  provider: 'google' | 'anonymous';
}

const STORAGE_KEY = 'omniclean_google_user';
const listeners: Array<(user: UserProfile | null) => void> = [];

export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
  listeners.forEach((fn) => fn(user));
}

export function subscribeAuth(fn: (user: UserProfile | null) => void): () => void {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export function signInWithGoogle(customEmail?: string, customName?: string): UserProfile {
  const email = customEmail || 'farjana.rafi1983@gmail.com';
  const name =
    customName ||
    email
      .split('@')[0]
      .replace('.', ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  const user: UserProfile = {
    name,
    email,
    provider: 'google',
  };
  setStoredUser(user);
  return user;
}

export function signOutGoogle(): void {
  setStoredUser(null);
}
