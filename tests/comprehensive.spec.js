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
    await page.goto('/courtroom-battle');
    await expect(page.locator('body')).toContainText(/does not have a validated legal-source layer or reviewed scoring method/i);
  });

  test('moot court scoring is marked in development', async ({ page }) => {
    await page.goto('/moot-court');
    await expect(page.locator('body')).toContainText(/scoring method and citation assessment have not been independently evaluated/i);
  });
});
