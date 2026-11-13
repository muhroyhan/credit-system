import { expect, test } from '@playwright/test';

test('REGISTRATION-E mismatching passwords stay on the form without sending registration', async ({
  page,
}) => {
  let submitted = 0;
  page.on('request', (request) => {
    if (
      request.method() === 'POST' &&
      request.url().endsWith('/api/debitor/register')
    ) {
      submitted++;
    }
  });
  await page.goto('/registration/sintetis-satu');
  await page.getByLabel(/^Nama lengkap/).fill('QA Synthetic');
  await page.getByLabel(/^Username/).fill('qa-validation-only');
  await page.getByLabel(/^Password/).fill('Synthetic123');
  await page.getByLabel(/^Konfirmasi password/).fill('Different123');
  await page.getByRole('button', { name: 'Daftar', exact: true }).click();
  await expect(page.getByText('Konfirmasi password tidak sama')).toBeVisible();
  await expect(page).toHaveURL(/\/registration\/sintetis-satu$/);
  expect(submitted).toBe(0);
});
