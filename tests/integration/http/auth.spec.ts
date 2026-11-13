import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { loginHeaders } from '../../e2e/fixtures/login';
import { fixtureToken } from '../../setup/token';

const password = process.env.SEED_PASSWORD;

test('AUTH-I rejects expired and invalid-claim tokens through Bun middleware', async ({
  request,
}) => {
  for (const claims of [
    { id: 900001, type: 'admin', slug: 'admin', exp: 1 },
    { id: 900001, type: 'root', slug: 'admin', exp: 1893456000 },
    { id: 900001, type: 'admin', slug: 'sintetis-satu', exp: 1893456000 },
  ]) {
    const token = fixtureToken(claims, process.env.JWT_SECRET ?? '');
    expect(
      (
        await request.get('/api/programs', {
          headers: { Authorization: `Bearer ${token}` },
        })
      ).status(),
    ).toBe(401);
  }
});

test('AUTH-I current roles and inactive accounts invalidate existing access', async ({
  request,
}) => {
  const writer = await loginHeaders(request, {
    type: 'admin',
    username: 'admin_sintetis',
  });
  const username = `qa-${randomUUID()}`;
  const input = {
    username,
    email: `${username}@example.invalid`,
    password: 'Synthetic123',
    isActive: true,
    roles: [{ programId: 900001, value: 'READ' }],
  };
  const created = await request.post('/api/admin-user/create', {
    headers: writer,
    data: input,
  });
  expect(created.status()).toBe(201);
  const { id } = await created.json();
  try {
    const session = await loginHeaders(request, {
      type: 'admin',
      username,
      password: input.password,
    });
    expect(
      (
        await request.get('/api/admin-user/list', { headers: session })
      ).status(),
    ).toBe(200);
    expect(
      (
        await request.put('/api/admin-user/update', {
          headers: writer,
          data: { ...input, id, roles: [] },
        })
      ).status(),
    ).toBe(200);
    expect(
      (
        await request.get('/api/admin-user/list', { headers: session })
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.put('/api/admin-user/update', {
          headers: writer,
          data: { ...input, id, isActive: false, roles: [] },
        })
      ).status(),
    ).toBe(200);
    expect(
      (await request.get('/api/programs', { headers: session })).status(),
    ).toBe(401);
    expect(
      (
        await request.post('/api/login', {
          data: { type: 'admin', username, password: input.password },
        })
      ).status(),
    ).toBe(401);
  } finally {
    expect(
      (
        await request.put('/api/admin-user/delete', {
          headers: writer,
          data: { id },
        })
      ).status(),
    ).toBe(200);
  }
});
test('login succeeds for each actor and protects references', async ({
  request,
}) => {
  for (const actor of [
    { type: 'admin', username: 'admin_sintetis' },
    { type: 'company', username: 'hrd_satu', slug: 'sintetis-satu' },
    { type: 'debitor', username: 'debitor_satu', slug: 'sintetis-satu' },
  ]) {
    const response = await request.post('/api/login', {
      data: { ...actor, password },
    });
    expect(response.status()).toBe(200);
    const session = await response.json();
    expect(session.type).toBe(actor.type);
    expect(JSON.stringify(session.userData)).not.toContain('password');
    expect(
      (
        await request.get('/api/programs', {
          headers: { Authorization: `Bearer ${session.authToken}` },
        })
      ).status(),
    ).toBe(200);
  }
  expect(
    (
      await request.post('/api/login', {
        data: {
          type: 'admin',
          username: 'admin_sintetis',
          password: 'incorrect',
        },
      })
    ).status(),
  ).toBe(401);
  expect(
    (
      await request.get('/api/programs', {
        headers: { Authorization: 'Bearer forged' },
      })
    ).status(),
  ).toBe(401);
  expect(
    (
      await request.post('/api/login', {
        data: {
          type: 'debitor',
          username: 'debitor_satu',
          password,
          slug: 'sintetis-dua',
        },
      })
    ).status(),
  ).toBe(401);
});
