import { employeeDocumentKinds } from '@credit/contracts';
import { employeeProfileFields } from '@web/features/employees/employees.constant';
import { type APIRequestContext, expect, test } from '@playwright/test';

const password = process.env.SEED_PASSWORD;
test.skip(!password, 'Synthetic database required');
async function login(
  request: APIRequestContext,
  username: string,
  type = 'company',
  slug = 'sintetis-satu',
) {
  const response = await request.post('/api/login', {
    data: { username, type, slug, password },
  });
  expect(response.status()).toBe(200);
  return { Authorization: `Bearer ${(await response.json()).authToken}` };
}
test('registration API rejects internal fields and isolates employee CRUD and document download', async ({
  request,
}) => {
  const company = await login(request, 'hrd_satu');
  const other = await login(request, 'hrd_dua', 'company', 'sintetis-dua');
  const reader = await login(request, 'admin_baca', 'admin', 'admin');
  const account = {
    namaLengkap: 'P05 API',
    username: `p05-api-${Date.now()}`,
    password: 'Secret123',
    slug: 'sintetis-satu',
  };
  expect(
    (
      await request.post('/api/debitor/register', {
        data: { ...account, userId: 900002 },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post('/api/debitor/register', {
        data: { ...account, slug: 'missing' },
      })
    ).status(),
  ).toBe(404);
  const response = await request.post('/api/debitor/register', {
    data: account,
  });
  expect(response.status()).toBe(201);
  const { id } = await response.json();
  const signedIn = await request.post('/api/login', {
    data: { ...account, type: 'debitor' },
  });
  expect(signedIn.status()).toBe(200);
  const self = { Authorization: `Bearer ${(await signedIn.json()).authToken}` };
  try {
    expect((await request.get('/api/debitor/list')).status()).toBe(401);
    expect(
      (await request.post('/api/debitor/register', { data: account })).status(),
    ).toBe(409);
    expect(
      (
        await request.get(`/api/debitor/detail?id=${id}`, { headers: other })
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.get('/api/debitor/detail?id=900002', { headers: self })
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.put('/api/debitor/update', {
          headers: reader,
          data: { id, namaLengkap: 'Denied', username: account.username },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.put('/api/debitor/delete', {
          headers: self,
          data: { id },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.get('/api/debitor/list?userId=900002', { headers: self })
      ).status(),
    ).toBe(403);
    const detail = await (
      await request.get(`/api/debitor/detail?id=${id}`, { headers: self })
    ).json();
    expect(detail.password).toBeUndefined();
    const listing = await (
      await request.get('/api/debitor/list', { headers: self })
    ).json();
    expect(listing.data.map((row: { id: number }) => row.id)).toEqual([id]);
    expect(
      (
        await request.put('/api/debitor/profile', {
          headers: self,
          data: { id, profile: {} },
        })
      ).status(),
    ).toBe(400);
    const docs = Object.fromEntries(
      employeeDocumentKinds.slice(0, 5).map((kind) => [
        kind,
        {
          name: `${kind}.pdf`,
          mimeType: 'application/pdf',
          buffer: Buffer.from(`%PDF-1.4 ${kind}`),
        },
      ]),
    );
    expect(
      (
        await request.post('/api/debitor/documents', {
          headers: self,
          multipart: {
            id: String(id),
            fotoUrl: {
              name: 'foto.pdf',
              mimeType: 'application/pdf',
              buffer: Buffer.from('%PDF-1.4 foto'),
            },
          },
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await request.post('/api/debitor/documents', {
          headers: self,
          multipart: {
            id: String(id),
            ...docs,
            fotoUrl: {
              name: 'fake.pdf',
              mimeType: 'application/pdf',
              buffer: Buffer.from('not a PDF'),
            },
          },
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await request.post('/api/debitor/documents', {
          headers: self,
          multipart: { id: String(id), ...docs },
        })
      ).status(),
    ).toBe(200);
    const download = await request.get(
      `/api/debitor/document?id=${id}&kind=slipGajiUrl`,
      { headers: self },
    );
    expect(download.status()).toBe(200);
    expect(await download.text()).toContain('slipGajiUrl');
    expect(
      (
        await request.get(`/api/debitor/document?id=${id}&kind=slipGajiUrl`, {
          headers: other,
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.get(`/api/debitor/document?id=${id}&kind=slipGajiUrl`)
      ).status(),
    ).toBe(401);
    expect(
      (
        await request.get('/api/debitor/export?format=xlsx&namaLengkap=P05', {
          headers: company,
        })
      ).status(),
    ).toBe(200);
    const otherList = await (
      await request.get('/api/debitor/list?namaLengkap=P05', { headers: other })
    ).json();
    expect(otherList.data).toEqual([]);
  } finally {
    expect(
      (
        await request.put('/api/debitor/delete', {
          headers: company,
          data: { id },
        })
      ).status(),
    ).toBe(200);
  }
});
test('nasabah registers, logs in, validates profile and uploads five distinct documents', async ({
  page,
  request,
}) => {
  const username = `p05-ui-${Date.now()}`;
  const company = await login(request, 'hrd_satu');
  let id: number | undefined;
  await page.goto('/registration/sintetis-satu');
  await page.getByRole('button', { name: 'Daftar', exact: true }).click();
  await expect(page.getByLabel(/^Nama lengkap/)).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await page.getByLabel(/^Nama lengkap/).fill('P05 UI');
  await page.getByLabel(/^Username/).fill(username);
  await page.getByLabel(/^Password/).fill('Secret123');
  await page.getByLabel(/^Konfirmasi password/).fill('Secret123');
  await page.getByRole('button', { name: 'Daftar', exact: true }).click();
  await expect(page).toHaveURL(/\/employees\/\d+\/edit$/);
  id = Number(new URL(page.url()).pathname.split('/')[2]);
  try {
    const profile = page.locator('form').filter({
      has: page.getByRole('heading', { name: 'Profil dan penghasilan' }),
    });
    await profile.getByRole('button', { name: 'Simpan profil' }).click();
    await expect(profile.getByLabel(/^Nomor induk/)).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    for (const [key, label] of employeeProfileFields) {
      await profile
        .getByLabel(new RegExp(`^${label}`))
        .fill(key === 'tanggalLahir' ? '1992-03-04' : 'Synthetic');
    }
    await profile.getByLabel(/^Nomor HP/).fill('08123456789');
    await profile.getByLabel('Pendapatan bersih bulanan').fill('5000000');
    await profile.getByRole('button', { name: 'Simpan profil' }).click();
    await expect(
      page.getByText('Profil tersimpan', { exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel(/^Nama lengkap/).first()).toHaveValue(
      'Synthetic',
    );
    await page.getByRole('button', { name: 'Simpan dokumen' }).click();
    await expect(page.getByText('Dokumen wajib diisi').first()).toBeVisible();
    for (let i = 0; i < 5; i++) {
      await page
        .locator('input[type=file]')
        .nth(i)
        .setInputFiles({
          name: 'synthetic.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from(`%PDF-1.4 ${employeeDocumentKinds[i]}`),
        });
    }
    await page.getByRole('button', { name: 'Simpan dokumen' }).click();
    await expect(
      page.getByText('Dokumen tersimpan', { exact: true }),
    ).toBeVisible();
    const downloadEvent = page.waitForEvent('download');
    await page
      .getByRole('button', { name: 'Unduh Slip gaji', exact: true })
      .click();
    expect((await downloadEvent).suggestedFilename()).toBe('slipGajiUrl.pdf');
    await page.getByRole('link', { name: 'Kembali', exact: true }).click();
    const row = page.getByRole('row').filter({
      has: page.getByRole('cell', { name: 'Synthetic', exact: true }).first(),
    });
    await row.getByRole('link', { name: 'Lihat' }).click();
    await expect(
      page.getByText('Tanggal lahir: 1992-03-04', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText('Nomor HP: 08123456789', { exact: true }),
    ).toBeVisible();
    await expect(page.locator('input')).toHaveCount(0);
  } finally {
    if (id) {
      await request.put('/api/debitor/delete', {
        headers: company,
        data: { id },
      });
    }
  }
});
test('HRD creates and deletes a scoped employee through standard pages', async ({
  page,
}) => {
  const username = `p05-hrd-${Date.now()}`;
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Jenis akun' }).click();
  await page.getByRole('option', { name: 'Perusahaan / HRD' }).click();
  await page.getByRole('textbox', { name: 'Perusahaan' }).click();
  await page.getByRole('option', { name: 'Perusahaan Sintetis Satu' }).click();
  await page.getByLabel('Username atau email').fill('hrd_satu');
  await page.getByLabel(/^Password/).fill(password ?? '');
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await page.getByRole('link', { name: 'Master Karyawan' }).click();
  await page.getByRole('link', { name: 'Tambah karyawan' }).click();
  await page.getByLabel(/^Nama lengkap/).fill(username);
  await page.getByLabel('Username karyawan').fill('debitor_satu');
  await page.getByLabel('Password karyawan').fill('Secret123');
  await page.getByRole('button', { name: 'Simpan akun' }).click();
  await expect(
    page.getByText('Username sudah digunakan', { exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/employees\/add$/);
  await page.getByLabel('Username karyawan').fill(username);
  await page.getByRole('button', { name: 'Simpan akun' }).click();
  await page.getByLabel('Cari nama').fill(username);
  const row = page
    .getByRole('row')
    .filter({ has: page.getByRole('cell', { name: new RegExp(username) }) });
  await expect(row).toBeVisible();
  await row.getByRole('link', { name: 'Ubah' }).click();
  await page
    .getByLabel(/^Nama lengkap/)
    .first()
    .fill(`${username}-edited`);
  await page.getByRole('button', { name: 'Simpan akun' }).click();
  await expect(page.getByText('Akun tersimpan', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Kembali', exact: true }).click();
  page.once('dialog', (d) => d.accept());
  await row.getByRole('button', { name: 'Hapus', exact: true }).click();
  await expect(row).toHaveCount(0);
});

test('employee pages reject direct anonymous URLs', async ({ page }) => {
  for (const path of [
    '/employees',
    '/employees/add',
    '/employees/900001',
    '/employees/900001/edit',
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
  }
});
