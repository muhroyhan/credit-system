import { expect, test } from '@playwright/test';
import { loginBrowser } from './fixtures/login';

test('listing search and header sort use shared query state', async ({
  page,
}) => {
  await loginBrowser(page, { type: 'admin', username: 'admin_sintetis' });
  for (const [link, endpoint, header, sortBy] of [
    ['Admin User', '/api/admin-user/list', 'Username', 'username'],
    ['Perusahaan', '/api/user/list', 'Nama', 'companyName'],
    ['Master Karyawan', '/api/debitor/list', 'Nama', 'namaLengkap'],
    ['Pengajuan Kredit', '/api/credit/list', 'Nominal', 'jumlahPengajuan'],
    [
      'Daftar Kredit Karyawan',
      '/api/credit/review/list',
      'Nominal',
      'jumlahPengajuan',
    ],
  ] as const) {
    await page.getByRole('link', { name: link, exact: true }).click();
    const column = page.getByRole('columnheader', {
      name: new RegExp(`^${header}`),
    });
    const sorted = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        url.pathname === endpoint &&
        url.searchParams.get('sortBy') === sortBy &&
        url.searchParams.get('sortDirection') === 'asc'
      );
    });
    await column.getByRole('button').click();
    expect((await sorted).ok()).toBe(true);
    await expect(column).toHaveAttribute('aria-sort', 'ascending');
    const reversed = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        url.pathname === endpoint &&
        url.searchParams.get('sortBy') === sortBy &&
        url.searchParams.get('sortDirection') === 'desc'
      );
    });
    await column.getByRole('button').click();
    expect((await reversed).ok()).toBe(true);
    await expect(column).toHaveAttribute('aria-sort', 'descending');
    const field = page.getByRole('textbox', { name: 'Cari', exact: true });
    const filtered = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        url.pathname === endpoint &&
        url.searchParams.get('search') === 'sintetis' &&
        url.searchParams.get('page') === '1'
      );
    });
    await field.fill('sintetis');
    expect((await filtered).ok()).toBe(true);
    const cleared = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname === endpoint && !url.searchParams.has('search');
    });
    await field.clear();
    expect((await cleared).ok()).toBe(true);
  }
});

test('all visible data columns support server-side sorting', async ({
  page,
}) => {
  await loginBrowser(page, { type: 'admin', username: 'admin_sintetis' });
  for (const [link, endpoint, columns] of [
    [
      'Admin User',
      '/api/admin-user/list',
      [
        ['Username', 'username'],
        ['Email', 'email'],
        ['Status', 'isActive'],
      ],
    ],
    [
      'Perusahaan',
      '/api/user/list',
      [
        ['Badan usaha', 'entityType'],
        ['Nama', 'companyName'],
        ['Username', 'username'],
        ['Email', 'email'],
        ['Slug', 'slug'],
        ['Status', 'status'],
      ],
    ],
    [
      'Master Karyawan',
      '/api/debitor/list',
      [
        ['Nomor induk', 'employeeId'],
        ['Nama', 'namaLengkap'],
        ['Alias', 'namaAlias'],
        ['NIK', 'noKtp'],
        ['Perusahaan', 'companyName'],
      ],
    ],
    [
      'Pengajuan Kredit',
      '/api/credit/list',
      [
        ['Nama', 'nama'],
        ['Perusahaan', 'companyName'],
        ['Nominal', 'jumlahPengajuan'],
        ['Tenor', 'jangkaWaktuBulan'],
        ['Status', 'status'],
      ],
    ],
    [
      'Daftar Kredit Karyawan',
      '/api/credit/review/list',
      [
        ['Nama', 'nama'],
        ['Perusahaan', 'companyName'],
        ['Nominal', 'jumlahPengajuan'],
        ['Status HRD', 'status'],
        ['Status BPR', 'statusAdminApproval'],
      ],
    ],
  ] as const) {
    await page.getByRole('link', { name: link, exact: true }).click();
    for (const [label, key] of columns) {
      const header = page.getByRole('columnheader', {
        name: new RegExp(`^${label} `),
      });
      const response = page.waitForResponse((result) => {
        const url = new URL(result.url());
        return (
          url.pathname === endpoint &&
          url.searchParams.get('sortBy') === key &&
          url.searchParams.get('sortDirection') === 'asc'
        );
      });
      await header.getByRole('button').click();
      expect((await response).status()).toBe(200);
      await expect(header).toHaveAttribute('aria-sort', 'ascending');
    }
  }
});
