import { test, expect } from '@playwright/test';

const publicRoutes = [
  '/',
  '/methodology/benchmark',
  '/investors',
  '/grievance',
  '/judge-ai',
  '/voice-assistant',
  '/agreements',
  '/bns',
  '/bns/section-103',
  '/ipc-to-bns',
  '/legal-sos',
  '/nyayproof',
  '/courtroom-battle',
  '/nyaycourt-simulator',
  '/moot-court',
];

test.describe('NyayNow public route smoke checks', () => {
  for (const route of publicRoutes) {
    test(`${route} responds successfully`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response, `No document response for ${route}`).not.toBeNull();
      expect(response.status(), `${route} should load`).toBe(200);
      await expect(page).toHaveTitle(/NyayNow/i);
    });
  }

  test('benchmark page does not claim unpublished results', async ({ page }) => {
    await page.goto('/methodology/benchmark');
    await expect(page.getByRole('heading', { name: /no public benchmark results yet/i })).toBeVisible();
    await expect(page.locator('body')).toContainText(/has not published a counsel-reviewed benchmark/i);
  });

  test('case outcome research clearly says it is in development', async ({ page }) => {
    await page.goto('/judge-ai');
    await expect(page.locator('body')).toContainText(/in development|disabled/i);
  });

  test('BNS directory withholds unreviewed section summaries', async ({ page }) => {
    await page.goto('/bns');
    await expect(page.locator('body')).toContainText(/has not completed source-linked, counsel-reviewed section explanations/i);
    await expect(page.getByRole('link', { name: /official india code text/i })).toHaveAttribute('href', /indiacode\.nic\.in/);
  });

  test('courtroom simulation is off unless its experimental flag is enabled', async ({ page }) => {
    await page.goto('/nyaycourt-simulator');
    await expect(page.locator('body')).toContainText(/does not have a validated legal-source layer or reviewed scoring method/i);
  });

  test('moot court scoring is marked in development', async ({ page }) => {
    await page.goto('/moot-court');
    await expect(page.locator('body')).toContainText(/scoring method and citation assessment have not been independently evaluated/i);
  });

  test('IPC-to-BNS converter labels seed data as pending counsel review', async ({ page }) => {
    await page.goto('/ipc-to-bns');
    await expect(page.getByRole('heading', { name: /ipc to bns converter/i })).toBeVisible();
    await expect(page.locator('body')).toContainText(/pending counsel review/i);
    await expect(page.getByRole('link', { name: /india code/i }).first()).toHaveAttribute(
      'href',
      /indiacode\.nic\.in/
    );
  });

  test('Legal SOS exposes offline dialable helplines', async ({ page }) => {
    await page.goto('/legal-sos');
    await expect(page.getByRole('heading', { name: /legal sos/i })).toBeVisible();
    await expect(page.locator('a[href="tel:112"]')).toBeVisible();
    await expect(page.locator('body')).toContainText(/National Emergency/i);
  });

  test('NyayProof certificate is marked as an advocate-review draft', async ({ page }) => {
    await page.goto('/nyayproof');
    await expect(page.getByRole('heading', { name: /section 63 bsa certificate/i })).toBeVisible();
    await expect(page.locator('body')).toContainText(/not a valid certificate/i);
    await expect(page.locator('body')).toContainText(/LEGAL-REVIEW-REQUIRED/i);
  });
});
