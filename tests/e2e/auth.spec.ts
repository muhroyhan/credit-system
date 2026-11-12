import { createHmac } from 'node:crypto';
import { expect, test } from '@playwright/test';

const password = process.env.SEED_PASSWORD;
test.skip(!password, 'Synthetic test database and seed password required');
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
test('admin can sign in and sign out', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Username atau email').fill('admin_sintetis');
  await page.getByLabel('Password').fill(password ?? '');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page.getByText('Masuk sebagai admin')).toBeVisible();
  await page.getByRole('button', { name: 'Keluar' }).click();
  await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
});

test('tenant actors can sign in', async ({ page }) => {
  for (const actor of [
    { label: 'Perusahaan / HRD', username: 'hrd_satu', result: 'company' },
    { label: 'Debitor', username: 'debitor_satu', result: 'debitor' },
  ]) {
    await page.goto('/');
    await page.getByRole('textbox', { name: 'Jenis akun' }).click();
    await page.getByRole('option', { name: actor.label }).click();
    await page.getByRole('textbox', { name: 'Perusahaan' }).click();
    await page
      .getByRole('option', { name: 'Perusahaan Sintetis Satu' })
      .click();
    await page.getByLabel('Username atau email').fill(actor.username);
    await page.getByLabel('Password').fill(password ?? '');
    await page.getByRole('button', { name: 'Masuk' }).click();
    await expect(page.getByText(`Masuk sebagai ${actor.result}`)).toBeVisible();
  }
});

test('rejects an expired token and direct unknown path', async ({
  request,
  page,
}) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET required');
  }
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  ).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ id: 900001, slug: 'admin', type: 'admin', exp: 1 }),
  ).toString('base64url');
  const signature = createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  expect(
    (
      await request.get('/api/programs', {
        headers: { Authorization: `Bearer ${header}.${payload}.${signature}` },
      })
    ).status(),
  ).toBe(401);
  await page.goto('/unavailable');
  await expect(page.getByText('Halaman tidak ditemukan')).toBeVisible();
});
