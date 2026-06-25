import { test } from '@playwright/test';

test('diagnose console errors', async ({ page }) => {
    page.on('console', msg => {
        console.log(`[BROWSER-CONSOLE] [${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', err => {
        console.log(`[BROWSER-ERROR] ${err.message}\n${err.stack}`);
    });

    console.log('=== Navigating to /judge-ai ===');
    await page.goto('/judge-ai');
    await page.waitForTimeout(3000);

    console.log('=== Navigating to /nyayvoice ===');
    await page.goto('/nyayvoice');
    await page.waitForTimeout(3000);

    console.log('=== Navigating to /drafting ===');
    await page.goto('/drafting');
    await page.waitForTimeout(3000);

    console.log('=== Navigating to /nearby ===');
    await page.goto('/nearby');
    await page.waitForTimeout(3000);
});
