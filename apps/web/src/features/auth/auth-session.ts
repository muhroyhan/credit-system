import { sessionSchema } from '@web/constant/schema';
import type { Session } from '@web/constant/type';
import { z } from 'zod';

const sessionStorageKey = 'credit-system.session';
const claimsSchema = z.object({ exp: z.number().int().positive() });

/** Restores a valid, unexpired session from this tab; the API verifies the token. */
export function readStoredSession(storage: Storage): Session | null {
  try {
    const raw = storage.getItem(sessionStorageKey);
    if (!raw) {
      return null;
    }
    const session = sessionSchema.safeParse(JSON.parse(raw));
    if (session.success) {
      const parts = session.data.authToken.split('.');
      const payload = parts[1];
      if (parts.length === 3 && payload) {
        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        const claims = claimsSchema.safeParse(JSON.parse(json));
        if (claims.success && claims.data.exp > Math.floor(Date.now() / 1000)) {
          return session.data;
        }
      }
    }
    storage.removeItem(sessionStorageKey);
  } catch {
    try {
      storage.removeItem(sessionStorageKey);
    } catch {
      // Storage can be disabled by the browser.
    }
  }
  return null;
}

/** Saves or clears this tab's session; unavailable storage leaves memory usable. */
export function writeStoredSession(storage: Storage, session: Session | null) {
  try {
    if (session) {
      storage.setItem(sessionStorageKey, JSON.stringify(session));
    } else {
      storage.removeItem(sessionStorageKey);
    }
  } catch {
    // Storage can be disabled by the browser.
  }
}
