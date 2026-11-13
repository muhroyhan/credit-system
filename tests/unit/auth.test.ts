import { loginSchema } from '@credit/contracts';
import { authenticate } from '@server/features/auth/auth.service';
import type { IdentityResolver } from '@server/features/auth/auth.type';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fixtureToken } from '../setup/token';

const secret = 'synthetic-unit-secret-at-least-32-characters';
const claims = { id: 1, type: 'admin', slug: 'admin', exp: 1893456000 };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe('AUTH-U login contracts', () => {
  it.each(['admin', 'company', 'debitor'])(
    'accepts a complete %s login',
    (type) => {
      expect(
        loginSchema.safeParse({
          type,
          username: 'synthetic',
          password: 'Synthetic123',
          slug: 'tenant',
        }).success,
      ).toBe(true);
    },
  );
  it.each([
    { type: 'company', username: 'u', password: 'p' },
    { type: 'debitor', username: 'u', password: 'p', slug: '' },
    { type: 'unknown', username: 'u', password: 'p' },
    { type: 'admin', username: '', password: 'p' },
    { type: 'admin', username: 'u', password: '' },
  ])('rejects invalid login %j', (input) => {
    expect(loginSchema.safeParse(input).success).toBe(false);
  });
});

describe('AUTH-U bearer verification', () => {
  function resolver() {
    vi.stubEnv('JWT_SECRET', secret);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    return vi.fn<IdentityResolver>().mockResolvedValue({
      id: 1,
      type: 'admin',
      slug: 'admin',
      permissions: [],
    });
  }

  it('resolves current identity for a valid signature', async () => {
    const resolve = resolver();
    expect(
      await authenticate(`Bearer ${fixtureToken(claims, secret)}`, resolve),
    ).toMatchObject({ id: 1, type: 'admin' });
    expect(resolve).toHaveBeenCalledExactlyOnceWith('admin', 1, 'admin');
  });

  it.each([undefined, '', 'Basic token', 'bearer token', 'Bearer forged'])(
    'rejects malformed authorization %s before resolving SQL identity',
    async (header) => {
      const resolve = resolver();
      expect(await authenticate(header, resolve)).toBeNull();
      expect(resolve).not.toHaveBeenCalled();
    },
  );

  it.each([
    { id: 0 },
    { id: 1.5 },
    { type: 'root' },
    { slug: '' },
    { exp: 1 },
    { exp: 1767225600 },
    { exp: '1893456000' },
  ])('rejects invalid or expired claims %j', async (patch) => {
    const resolve = resolver();
    const token = fixtureToken({ ...claims, ...patch }, secret);
    expect(await authenticate(`Bearer ${token}`, resolve)).toBeNull();
    expect(resolve).not.toHaveBeenCalled();
  });

  it('rejects signatures from another key', async () => {
    const resolve = resolver();
    expect(
      await authenticate(
        `Bearer ${fixtureToken(claims, 'wrong-key')}`,
        resolve,
      ),
    ).toBeNull();
    expect(resolve).not.toHaveBeenCalled();
  });

  it('rejects a revoked identity even with a valid token', async () => {
    const resolve = resolver().mockResolvedValue(null);
    expect(
      await authenticate(`Bearer ${fixtureToken(claims, secret)}`, resolve),
    ).toBeNull();
  });

  it('propagates configuration and repository failures', async () => {
    const resolve = resolver();
    vi.stubEnv('JWT_SECRET', '');
    await expect(authenticate('Bearer token', resolve)).rejects.toThrow(
      'JWT_SECRET',
    );
    vi.stubEnv('JWT_SECRET', secret);
    const error = new Error('synthetic repository failure');
    resolve.mockRejectedValue(error);
    await expect(
      authenticate(`Bearer ${fixtureToken(claims, secret)}`, resolve),
    ).rejects.toBe(error);
  });
});
