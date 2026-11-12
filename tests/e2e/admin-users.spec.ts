import { expect, test } from '@playwright/test';

const password = process.env.SEED_PASSWORD;
test.skip(!password, 'Synthetic test database and seed password required');
test('admin CRUD, role checks and conflicts', async ({ request }) => {
  const signIn = async (username: string) => {
    const response = await request.post('/api/login', {
      data: { type: 'admin', username, password },
    });
    expect(response.status()).toBe(200);
    return (await response.json()).authToken as string;
  };
  const writer = await signIn('admin_sintetis');
  const reader = await signIn('admin_baca');
  const writeHeaders = { Authorization: `Bearer ${writer}` };
  const readHeaders = { Authorization: `Bearer ${reader}` };
  expect((await request.get('/api/admin-user/list')).status()).toBe(401);
  expect(
    (
      await request.get('/api/admin-user/list', { headers: readHeaders })
    ).status(),
  ).toBe(200);
  expect(
    (
      await request.get('/api/admin-user/list?sortBy=invalid', {
        headers: readHeaders,
      })
    ).status(),
  ).toBe(400);
  const ascending = await (
    await request.get(
      '/api/admin-user/list?sortBy=username&sortDirection=asc&limit=1',
      { headers: readHeaders },
    )
  ).json();
  const descending = await (
    await request.get(
      '/api/admin-user/list?sortBy=username&sortDirection=desc&limit=1',
      { headers: readHeaders },
    )
  ).json();
  expect(ascending.data[0].username < descending.data[0].username).toBe(true);
  const data = {
    username: 'p03_admin',
    email: 'p03@example.invalid',
    password: 'Secret123',
    isActive: true,
    roles: [{ programId: 900002, value: 'READ' }],
  };
  expect(
    (
      await request.post('/api/admin-user/create', {
        headers: readHeaders,
        data,
      })
    ).status(),
  ).toBe(403);
  const created = await request.post('/api/admin-user/create', {
    headers: writeHeaders,
    data,
  });
  expect(created.status()).toBe(201);
  const { id } = await created.json();
  expect(
    (await request.get('/api/admin-user/export?format=pdf')).status(),
  ).toBe(401);
  expect(
    (
      await request.get('/api/admin-user/export?format=csv', {
        headers: readHeaders,
      })
    ).status(),
  ).toBe(400);
  const pdf = await request.get(
    '/api/admin-user/export?format=pdf&username=p03_admin&limit=1',
    { headers: readHeaders },
  );
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()['content-type']).toContain('application/pdf');
  const pdfText = (await pdf.body()).toString('latin1');
  expect(pdfText).toContain('p03_admin');
  expect(pdfText).not.toContain('admin_sintetis');
  const unlimited = await request.get(
    '/api/admin-user/export?format=pdf&username=admin_&limit=1',
    { headers: readHeaders },
  );
  const unlimitedText = (await unlimited.body()).toString('latin1');
  expect(unlimitedText).toContain('admin_sintetis');
  expect(unlimitedText).toContain('admin_baca');

  const detail = await request.get(`/api/admin-user/detail?id=${id}`, {
    headers: readHeaders,
  });
  expect(detail.status()).toBe(200);
  const record = await detail.json();
  expect(record.roles).toEqual([{ programId: 900002, value: 'READ' }]);
  expect(JSON.stringify(record)).not.toContain('password');
  expect(
    (
      await request.post('/api/admin-user/create', {
        headers: writeHeaders,
        data,
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await request.put('/api/admin-user/update', {
        headers: writeHeaders,
        data: { ...data, id, roles: [{ programId: 123456, value: 'UPDATE' }] },
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await (
        await request.get(`/api/admin-user/detail?id=${id}`, {
          headers: readHeaders,
        })
      ).json()
    ).roles,
  ).toEqual([{ programId: 900002, value: 'READ' }]);
  expect(
    (
      await request.put('/api/admin-user/update', {
        headers: writeHeaders,
        data: { ...data, id, roles: [{ programId: 900003, value: 'UPDATE' }] },
      })
    ).status(),
  ).toBe(200);
  const filtered = await (
    await request.get('/api/admin-user/list?username=p03_admin', {
      headers: readHeaders,
    })
  ).json();
  expect(filtered.count).toBe(1);
  expect(
    (
      await request.put('/api/admin-user/delete', {
        headers: writeHeaders,
        data: { id },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await request.get(`/api/admin-user/detail?id=${id}`, {
        headers: readHeaders,
      })
    ).status(),
  ).toBe(404);
});
test('admin interface adds and finds a user', async ({ page }) => {
  const username = `p03_ui_${Date.now()}`;
  await page.goto('/');
  await page.getByLabel('Username atau email').fill('admin_sintetis');
  await page.getByLabel('Password').fill(password ?? '');
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await page.getByRole('link', { name: 'Admin User', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Admin User' })).toBeVisible();
  await page.getByRole('link', { name: 'Tambah administrator' }).click();
  await page.getByLabel('Username administrator').fill(username);
  await page
    .getByLabel('Email administrator')
    .fill(`${username}@example.invalid`);
  await page.getByLabel('Password administrator').fill('Secret123');
  await page.getByRole('button', { name: 'Simpan' }).click();
  const row = page
    .getByRole('row')
    .filter({ has: page.getByRole('cell', { name: username }) });
  await expect(row).toBeVisible();
  await row.getByRole('link', { name: 'Ubah' }).click();
  await expect(page).toHaveURL(/\/admin-users\/\d+\/edit$/);
  await page
    .getByLabel('Email administrator')
    .fill(`${username}_edit@example.invalid`);
  await page.getByRole('button', { name: 'Simpan' }).click();
  await expect(
    row.getByRole('cell', { name: `${username}_edit@example.invalid` }),
  ).toBeVisible();
  await row.getByRole('link', { name: 'Lihat' }).click();
  await expect(
    page.getByText(`Email: ${username}_edit@example.invalid`),
  ).toBeVisible();
  await expect(page.locator('input')).toHaveCount(0);
  await page.getByRole('link', { name: 'Kembali' }).click();
  await page
    .getByRole('textbox', { name: 'Username', exact: true })
    .fill(username);
  await expect(page.getByText('Total: 1', { exact: true })).toBeVisible();
  for (const format of ['PDF', 'XLSX']) {
    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', { name: `Export ${format}` }).click();
    const download = await downloaded;
    expect(download.suggestedFilename()).toBe(
      `admin-users.${format.toLowerCase()}`,
    );
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const bytes = Buffer.concat(chunks);
    expect(bytes.subarray(0, format === 'PDF' ? 4 : 2).toString()).toBe(
      format === 'PDF' ? '%PDF' : 'PK',
    );
  }
  page.once('dialog', (dialog) => dialog.accept());
  await row.getByRole('button', { name: 'Hapus' }).click();
  await expect(row).toHaveCount(0);
});

test('read-only admin can inspect but cannot edit', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Username atau email').fill('admin_baca');
  await page.getByLabel('Password').fill(password ?? '');
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await page.getByRole('link', { name: 'Admin User', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Admin User' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Tambah administrator' }),
  ).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Ubah' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Lihat' }).first().click();
  await expect(
    page.getByRole('heading', { name: 'Detail administrator' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simpan' })).toHaveCount(0);
  await expect(page.locator('input')).toHaveCount(0);
  await page.evaluate(() => {
    history.pushState({}, '', '/admin-users/add');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByText('Akses ditolak')).toBeVisible();
  await expect(page.locator('input')).toHaveCount(0);
});

test('protected feature URLs redirect anonymous visitors to login', async ({
  page,
}) => {
  for (const path of [
    '/admin-users',
    '/admin-users/add',
    '/admin-users/900001/edit',
    '/admin-users/900001',
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole('button', { name: 'Masuk', exact: true }),
    ).toBeVisible();
  }
});

test('individual ACL values apply independently', async ({ request }) => {
  const login = async (username: string, pass: string) => {
    const result = await request.post('/api/login', {
      data: { type: 'admin', username, password: pass },
    });
    expect(result.status()).toBe(200);
    return { Authorization: `Bearer ${(await result.json()).authToken}` };
  };
  const writer = await login('admin_sintetis', password ?? '');
  const input = {
    username: 'acl_creator',
    email: 'acl_creator@example.invalid',
    password: 'Synthetic123',
    isActive: true,
    roles: [
      { programId: 900001, value: 'CREATE' },
      { programId: 900001, value: 'APPROVAL' },
    ],
  };
  const response = await request.post('/api/admin-user/create', {
    headers: writer,
    data: input,
  });
  expect(response.status()).toBe(201);
  const { id } = await response.json();
  let createdId: number | undefined;
  try {
    const detail = await (
      await request.get(`/api/admin-user/detail?id=${id}`, { headers: writer })
    ).json();
    expect(detail.roles).toEqual(expect.arrayContaining(input.roles));
    const limited = await login(input.username, input.password);
    expect(
      (
        await request.get('/api/admin-user/list', { headers: limited })
      ).status(),
    ).toBe(403);
    const created = await request.post('/api/admin-user/create', {
      headers: limited,
      data: {
        ...input,
        username: 'acl_created',
        email: 'acl_created@example.invalid',
        roles: [],
      },
    });
    expect(created.status()).toBe(201);
    createdId = (await created.json()).id;
    expect(
      (
        await request.put('/api/admin-user/delete', {
          headers: limited,
          data: { id: createdId },
        })
      ).status(),
    ).toBe(403);
  } finally {
    if (createdId) {
      await request.put('/api/admin-user/delete', {
        headers: writer,
        data: { id: createdId },
      });
    }
    await request.put('/api/admin-user/delete', {
      headers: writer,
      data: { id },
    });
  }
});
