import { app } from '@credit/server/app';
import { describe, expect, it } from 'vitest';
import { fixtureToken } from '../setup/token';

function headers(id = 900001, type = 'admin', slug = 'admin') {
  return {
    authorization: `Bearer ${fixtureToken(
      { id, type, slug, exp: Math.floor(Date.now() / 1000) + 3600 },
      process.env.JWT_SECRET ?? '',
    )}`,
  };
}

const privateRoutes = [
  ['GET', '/programs'],
  ['GET', '/entity-types'],
  ['GET', '/countries'],
  ['GET', '/constants'],
  ['GET', '/dashboard/data'],
  ...['/admin-user', '/user', '/debitor'].flatMap((prefix) => [
    ['GET', `${prefix}/list`],
    ['GET', `${prefix}/detail`],
    ['GET', `${prefix}/export`],
    ['POST', `${prefix}/create`],
    ['PUT', `${prefix}/update`],
    ['PUT', `${prefix}/delete`],
  ]),
  ['PUT', '/debitor/profile'],
  ['POST', '/debitor/documents'],
  ['GET', '/debitor/document'],
  ['GET', '/user/bunga-kredits'],
  ['GET', '/credit/list'],
  ['GET', '/credit/detail'],
  ['POST', '/credit/create'],
  ['PUT', '/credit/update'],
  ['POST', '/credit/simulation'],
  ['GET', '/credit/rates'],
  ['GET', '/credit/status'],
  ['PUT', '/credit/confirm'],
  ['PUT', '/credit/cancel'],
  ['GET', '/credit/export'],
  ['GET', '/credit/export-zip'],
  ['GET', '/credit/doc'],
  ['GET', '/credit/doc/count'],
  ['POST', '/credit/doc/render'],
  ['GET', '/credit/review/list'],
  ['GET', '/credit/review/detail'],
  ['GET', '/credit/review/export'],
  ['GET', '/credit/review/export-zip'],
  ['PUT', '/credit/review'],
];

describe('API-I authentication precedes validation on every private route', () => {
  it.each(privateRoutes)(
    '%s %s rejects anonymous and forged requests',
    async (method, path) => {
      for (const authorization of ['', 'Bearer forged']) {
        const response = await app.request(`/api${path}`, {
          method,
          headers: { authorization, 'Content-Type': 'application/json' },
          ...(method === 'GET' ? {} : { body: '{malformed' }),
        });
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ error: 'unauthorized' });
      }
    },
  );
});

describe('API-I authenticated input boundaries', () => {
  it.each([
    ['POST', '/admin-user/create'],
    ['PUT', '/admin-user/update'],
    ['PUT', '/admin-user/delete'],
    ['POST', '/user/create'],
    ['PUT', '/user/update'],
    ['PUT', '/user/delete'],
    ['POST', '/debitor/create'],
    ['PUT', '/debitor/update'],
    ['PUT', '/debitor/delete'],
    ['PUT', '/debitor/profile'],
    ['POST', '/credit/create'],
    ['PUT', '/credit/update'],
    ['PUT', '/credit/confirm'],
    ['PUT', '/credit/cancel'],
    ['POST', '/credit/doc/render'],
    ['PUT', '/credit/review'],
    ['POST', '/credit/simulation'],
  ])('%s %s rejects malformed JSON and wrong shape', async (method, path) => {
    for (const body of ['{bad', 'null', '[]', '{}']) {
      const response = await app.request(`/api${path}`, {
        method,
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body,
      });
      expect(response.status).toBe(400);
    }
  });
  it.each(['/admin-user', '/user', '/debitor', '/credit', '/credit/review'])(
    '%s rejects invalid detail IDs and unsafe list queries',
    async (prefix) => {
      for (const query of ['id=0', 'id=-1', 'id=1.5', 'id=NaN', '']) {
        expect(
          (
            await app.request(`/api${prefix}/detail?${query}`, {
              headers: headers(),
            })
          ).status,
        ).toBe(400);
      }
      for (const query of [
        'page=0',
        'limit=101',
        'sortBy=password',
        'sortDirection=ASC',
      ]) {
        expect(
          (
            await app.request(`/api${prefix}/list?${query}`, {
              headers: headers(),
            })
          ).status,
        ).toBe(400);
      }
      expect(
        (
          await app.request(`/api${prefix}/detail?id=2147483647`, {
            headers: headers(),
          })
        ).status,
      ).toBe(404);
    },
  );
  it.each(['/admin-user', '/user', '/debitor', '/credit', '/credit/review'])(
    '%s rejects unsupported file format',
    async (prefix) => {
      expect(
        (
          await app.request(`/api${prefix}/export?format=xml`, {
            headers: headers(),
          })
        ).status,
      ).toBe(400);
    },
  );
});
