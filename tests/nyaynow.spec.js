import { test, expect } from '@playwright/test';

test('nyaynow.in loads correctly', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/NyayNow/i);
});
