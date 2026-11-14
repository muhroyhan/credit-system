import { connectDatabase } from '@credit/database/client';
import { credits } from '@credit/database/schema';
import { expect, type Page, type TestInfo } from '@playwright/test';
import { inArray } from 'drizzle-orm';
import { loginBrowser } from './fixtures/login';
import { test } from './fixtures/test';

async function capture(page: Page, info: TestInfo, name: string) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: info.outputPath(`${name}.png`),
    fullPage: true,
  });
}

async function navigate(page: Page, name: string) {
  const trigger = page.getByRole('button', { name: 'Buka menu' });
  if (await trigger.isVisible()) {
    await trigger.click();
  }
  await page.getByRole('link', { name, exact: true }).click();
}

for (const viewport of [
  { name: 'mobile', width: 320, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]) {
  test(`all feature surfaces fit ${viewport.name}`, async ({ page }, info) => {
    test.setTimeout(90000);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize(viewport);
    const db = connectDatabase().db;
    const rows = await db
      .insert(credits)
      .values([
        {
          debitorId: 900001,
          status: 'pending',
          jumlahPengajuan: '12000000',
          jangkaWaktuBulan: 12,
        },
        {
          debitorId: 900001,
          status: 'approved',
          statusAdminApproval: 'approved',
          jumlahPengajuan: '15000000',
          jangkaWaktuBulan: 12,
        },
      ])
      .$returningId();
    const pending = rows[0];
    const approved = rows[1];
    if (!pending || !approved) {
      throw new Error('Missing responsive credit fixtures');
    }
    try {
      for (const route of ['/login', '/registration/sintetis-satu']) {
        await page.goto(route);
        await expect(page.locator('main')).toHaveCSS(
          'background-color',
          'rgb(240, 240, 240)',
        );
        await expect(page.locator('.mantine-Paper-root')).toHaveCSS(
          'background-color',
          'rgb(255, 255, 255)',
        );
        await capture(
          page,
          info,
          route === '/login' ? 'login' : 'registration',
        );
      }
      await loginBrowser(page, { type: 'admin', username: 'admin_sintetis' });
      await expect(
        page.getByText('Jumlah debitor:', { exact: false }),
      ).toBeVisible();
      await capture(page, info, 'dashboard');
      if (viewport.name === 'mobile') {
        const trigger = page.getByRole('button', { name: 'Buka menu' });
        await trigger.click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toBeHidden();
        await expect(trigger).toBeFocused();
      }
      for (const feature of [
        {
          menu: 'Admin User',
          prefix: '/admin-users',
          id: 900001,
          add: 'Tambah administrator',
          field: 'Username administrator',
          back: 'Batal',
        },
        {
          menu: 'Perusahaan',
          prefix: '/companies',
          id: 900001,
          add: 'Tambah perusahaan',
          field: 'Nama perusahaan',
          back: 'Batal',
        },
        {
          menu: 'Master Karyawan',
          prefix: '/employees',
          id: 900001,
          add: 'Tambah karyawan',
          field: 'Username karyawan',
          back: 'Kembali',
        },
        {
          menu: 'Pengajuan Kredit',
          prefix: '/credits',
          id: pending.id,
          add: 'Tambah pengajuan',
          field: 'Nominal pengajuan',
          back: 'Kembali',
        },
      ]) {
        await navigate(page, feature.menu);
        await expect(
          page.getByRole('region', { name: 'Tabel hasil' }),
        ).toBeVisible();
        await expect(
          page.locator(`a[href="${feature.prefix}/${feature.id}"]`),
        ).toBeVisible();
        await capture(page, info, `${feature.prefix.slice(1)}-list`);
        await page
          .getByRole('link', { name: feature.add, exact: true })
          .click();
        await expect(page.getByLabel(feature.field)).toBeVisible();
        if (feature.prefix === '/companies') {
          await page
            .getByRole('button', { name: 'Tambah bunga', exact: true })
            .click();
          await page
            .getByRole('button', { name: 'Tambah biaya', exact: true })
            .click();
        }
        await capture(page, info, `${feature.prefix.slice(1)}-add`);
        await page
          .getByRole('link', { name: feature.back, exact: true })
          .click();
        await page
          .locator(`a[href="${feature.prefix}/${feature.id}/edit"]`)
          .click();
        await expect(page.getByLabel(feature.field)).toBeVisible();
        await capture(page, info, `${feature.prefix.slice(1)}-edit`);
        await page
          .getByRole('link', { name: feature.back, exact: true })
          .click();
        await page.locator(`a[href="${feature.prefix}/${feature.id}"]`).click();
        await expect(page.getByRole('definition').first()).toBeVisible();
        await capture(page, info, `${feature.prefix.slice(1)}-detail`);
      }
      await navigate(page, 'Daftar Kredit Karyawan');
      await expect(
        page.locator(`a[href="/credit-reviews/${approved.id}"]`),
      ).toBeVisible();
      await capture(page, info, 'review-list');
      await page.locator(`a[href="/credit-reviews/${approved.id}"]`).click();
      await expect(
        page.getByRole('heading', { name: 'Review Kredit', exact: true }),
      ).toBeVisible();
      await capture(page, info, 'review-detail');
      await page
        .getByRole('link', { name: 'Ubah keputusan', exact: true })
        .click();
      await expect(
        page.getByRole('textbox', { name: 'Keputusan BPR', exact: true }),
      ).toBeVisible();
      await capture(page, info, 'review-edit');
      await page.getByRole('button', { name: 'Keluar', exact: true }).click();
      await loginBrowser(page, { type: 'debitor', username: 'debitor_satu' });
      await expect(
        page.getByText('Jumlah debitor:', { exact: false }),
      ).toBeVisible();
      await navigate(page, 'Pengajuan Kredit');
      await page.locator(`a[href="/credits/${approved.id}"]`).click();
      await expect(page.getByLabel('Bank', { exact: true })).toBeVisible();
      await capture(page, info, 'customer-confirmation');
      expect(errors).toEqual([]);
    } finally {
      await db.delete(credits).where(
        inArray(
          credits.id,
          rows.map((row) => row.id),
        ),
      );
    }
  });
}
