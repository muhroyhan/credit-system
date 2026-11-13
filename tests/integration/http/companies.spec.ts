import { expect, test } from '@playwright/test';
import { loginHeaders } from '../../e2e/fixtures/login';

const password = process.env.SEED_PASSWORD;
test('company API permissions, tenant scope and deletion guard', async ({
  request,
}) => {
  const login = async (
    username: string,
    type: 'admin' | 'company' | 'debitor' = 'admin',
    slug?: string,
  ) => {
    return loginHeaders(request, { username, type, password, slug });
  };
  const writer = await login('admin_sintetis');
  const reader = await login('admin_baca');
  const company = await login('hrd_satu', 'company', 'sintetis-satu');
  expect((await request.get('/api/user/list')).status()).toBe(401);
  expect(
    (await request.get('/api/user/list', { headers: reader })).status(),
  ).toBe(200);
  expect(
    (await request.get('/api/user/list', { headers: company })).status(),
  ).toBe(403);
  expect(
    (
      await request.get('/api/user/bunga-kredits?slug=sintetis-dua', {
        headers: company,
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.get('/api/user/bunga-kredits?slug=sintetis-satu', {
        headers: company,
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await request.put('/api/user/delete', {
        headers: writer,
        data: { id: 900001 },
      })
    ).status(),
  ).toBe(409);
  const input = {
    entityTypeId: 900001,
    companyName: 'P04 API',
    username: 'p04-api',
    email: 'p04-api@example.invalid',
    slug: 'p04-api',
    password: 'Secret123',
    status: 'active',
    bungaKredits: [{ bungaPercentage: '1', jangkaWaktuBulan: '12' }],
    biaya: [{ expenseType: 'Admin', type: '%', value: 1 }],
  };
  expect(
    (
      await request.post('/api/user/create', { headers: reader, data: input })
    ).status(),
  ).toBe(403);
  const created = await request.post('/api/user/create', {
    headers: writer,
    data: input,
  });
  expect(created.status()).toBe(201);
  const { id } = await created.json();
  try {
    expect(
      (
        await request.post('/api/user/create', { headers: writer, data: input })
      ).status(),
    ).toBe(409);
    const before = await (
      await request.get(`/api/user/detail?id=${id}`, { headers: reader })
    ).json();
    expect(before.bungaKredits).toHaveLength(1);
    expect(before.password).toBeUndefined();
    expect(
      (
        await request.put('/api/user/update', {
          headers: writer,
          data: { ...input, id, biaya: [{ ...input.biaya[0], id: 123456 }] },
        })
      ).status(),
    ).toBe(409);
    expect(
      (
        await request.put('/api/user/update', {
          headers: writer,
          data: { ...input, id, bungaKredits: [], biaya: [] },
        })
      ).status(),
    ).toBe(200);
    const after = await (
      await request.get(`/api/user/detail?id=${id}`, { headers: reader })
    ).json();
    expect(after.bungaKredits).toEqual([]);
    expect(after.biaya).toEqual([]);
  } finally {
    expect(
      (
        await request.put('/api/user/delete', { headers: writer, data: { id } })
      ).status(),
    ).toBe(200);
  }
});
