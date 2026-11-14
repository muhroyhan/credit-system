import { expect, test } from '@playwright/test';
import { loginBrowser } from './fixtures/login';

for (const viewport of [
  { name: 'mobile', width: 320, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]) {
  test(`navigation, list and form fit ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await loginBrowser(page, { type: 'admin', username: 'admin_sintetis' });
    await expect(
      page.getByText('Jumlah debitor:', { exact: false }),
    ).toBeVisible();
    const menu = page.getByRole('button', { name: 'Buka menu' });
    if (viewport.name === 'mobile') {
      await menu.click();
    }
    await page.getByRole('link', { name: 'Admin User', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Admin User' }),
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Tabel hasil' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.getByRole('link', { name: 'Tambah administrator' }).click();
    await expect(page.getByLabel('Username administrator')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
