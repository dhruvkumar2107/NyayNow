import { test } from '@playwright/test';

test('print visible text on loading pages', async ({ page }) => {
    console.log('=== VISITING /judge-ai ===');
    await page.goto('/judge-ai');
    await page.waitForTimeout(5000);
    const judgeAIText = await page.innerText('body');
    console.log('--- VISIBLE TEXT ON /judge-ai ---');
    console.log(judgeAIText);

    console.log('=== VISITING /drafting ===');
    await page.goto('/drafting');
    await page.waitForTimeout(5000);
    const draftingText = await page.innerText('body');
    console.log('--- VISIBLE TEXT ON /drafting ---');
    console.log(draftingText);
});
