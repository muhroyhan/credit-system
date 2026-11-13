import { connectDatabase } from '@credit/database/client';
import { app } from '@credit/server/app';
import { referenceRepository } from '@credit/server/reference-repository';
import { describe, expect, it } from 'vitest';
import { fixtureToken } from '../setup/token';

describe('reference data on isolated mysql', () => {
  it('blocks all private routes even with untrusted authorization header', async () => {
    for (const path of ['programs', 'entity-types', 'countries', 'constants']) {
      const response = await app.request(`/api/${path}`, {
        headers: { authorization: 'Bearer forged' },
      });
      expect(response.status).toBe(401);
    }
  });
  it('reuses the pool across repository calls', async () => {
    const first = connectDatabase();
    await referenceRepository.listPrograms();
    await referenceRepository.listCountries();
    expect(connectDatabase().pool).toBe(first.pool);
    expect(await referenceRepository.listPrograms()).toBeDefined();
  });
  it('returns seeded data through routes and filters constants', async () => {
    const denied = await app.request('/api/programs');
    expect(denied.status).toBe(401);
    // Sign a fixture token; production middleware still validates it and resolves
    // the seeded account from MySQL. Login with bcrypt is covered by Bun E2E.
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is required for integration tests');
    }
    const session = {
      authToken: fixtureToken(
        {
          id: 900001,
          slug: 'admin',
          type: 'admin',
          exp: Math.floor(Date.now() / 1000) + 60,
        },
        secret,
      ),
    };
    const response = await app.request('/api/programs', {
      headers: { authorization: `Bearer ${session.authToken}` },
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ abbreviation: 'USA' }),
        expect.objectContaining({ abbreviation: 'CGP' }),
      ]),
    );
    const countries = await (
      await app.request('/api/countries', {
        headers: { authorization: `Bearer ${session.authToken}` },
      })
    ).json();
    expect(countries).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'ID' })]),
    );
    expect(
      (
        await (
          await app.request('/api/entity-types', {
            headers: { authorization: `Bearer ${session.authToken}` },
          })
        ).json()
      ).length,
    ).toBeGreaterThan(0);
    expect(
      await (
        await app.request('/api/constants?name=absent', {
          headers: { authorization: `Bearer ${session.authToken}` },
        })
      ).json(),
    ).toEqual([]);
    expect(
      await (
        await app.request('/api/constants?name=contoh', {
          headers: { authorization: `Bearer ${session.authToken}` },
        })
      ).json(),
    ).toEqual([expect.objectContaining({ name: 'contoh' })]);
    const slugs = await (await app.request('/api/user/slugs')).json();
    expect(slugs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ slug: 'sintetis-satu' }),
        expect.objectContaining({ slug: 'sintetis-dua' }),
      ]),
    );
    expect(JSON.stringify(slugs)).not.toContain('password');
  });
});
