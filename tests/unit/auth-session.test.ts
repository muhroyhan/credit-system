import {
  readStoredSession,
  writeStoredSession,
} from '@web/features/auth/auth-session';
import { describe, expect, it, vi } from 'vitest';

function storage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => Array.from(data.keys())[index] ?? null,
    removeItem: (key) => {
      data.delete(key);
    },
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

describe('tab session persistence', () => {
  it('restores a valid session and clears it on logout', () => {
    const store = storage();
    const token = `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 }))}.signature`;
    const session = {
      authToken: token,
      type: 'admin' as const,
      userData: { id: 1 },
    };
    writeStoredSession(store, session);
    expect(readStoredSession(store)).toEqual(session);
    writeStoredSession(store, null);
    expect(readStoredSession(store)).toBeNull();
  });

  it('rejects expired and malformed stored sessions', () => {
    const store = storage();
    const token = `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 1 }))}.signature`;
    writeStoredSession(store, {
      authToken: token,
      type: 'admin',
      userData: { id: 1 },
    });
    expect(readStoredSession(store)).toBeNull();
    expect(store.length).toBe(0);
    store.setItem('credit-system.session', '{invalid');
    expect(readStoredSession(store)).toBeNull();
    expect(store.length).toBe(0);
  });

  it('continues safely when storage access fails', () => {
    const store = storage();
    vi.spyOn(store, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(store, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readStoredSession(store)).toBeNull();
    expect(() => writeStoredSession(store, null)).not.toThrow();
  });
});
