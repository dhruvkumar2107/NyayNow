import { test, expect } from '@playwright/test';

const PAGES = [
    { path: '/', title: /NyayNow/i, canonical: 'https://nyaynow.in' },
    { path: '/about', title: /About Us/i, canonical: 'https://nyaynow.in/about' },
    { path: '/pricing', title: /Pricing/i, canonical: 'https://nyaynow.in/pricing' },
    { path: '/terms', title: /Terms/i, canonical: 'https://nyaynow.in/terms' },
    { path: '/privacy', title: /Privacy/i, canonical: 'https://nyaynow.in/privacy' },
    { path: '/disclaimer', title: /Disclaimer/i, canonical: 'https://nyaynow.in/disclaimer' },
    { path: '/contact', title: /Contact/i, canonical: 'https://nyaynow.in/contact' },
    { path: '/refund', title: /Refund/i, canonical: 'https://nyaynow.in/refund' },
    { path: '/login', title: /Sign In|Login/i, canonical: 'https://nyaynow.in/login' },
    { path: '/register', title: /Create an Account/i, canonical: 'https://nyaynow.in/register' },
    { path: '/judge-ai', title: /Judge AI/i, canonical: 'https://nyaynow.in/judge-ai', waitText: 'Predictive Justice Engine' },
    { path: '/drafting', title: /Drafting/i, canonical: 'https://nyaynow.in/drafting', waitText: 'Smart Drafting Lab' },
    { path: '/nearby', title: /Nearby/i, canonical: 'https://nyaynow.in/nearby', waitText: 'Enable AR Vision' },
    { path: '/nyaycourt-simulator', title: /NyayCourt Simulator/i, canonical: 'https://nyaynow.in/nyaycourt-simulator' },
    { path: '/nyayvoice', title: /NyayVoice/i, canonical: 'https://nyaynow.in/nyayvoice' }
];

test.describe('NyayNow Page Verification Suite', () => {
    
    for (const pageInfo of PAGES) {
        test(`Page verification: ${pageInfo.path}`, async ({ page }) => {
            console.log(`=== Testing ${pageInfo.path} ===`);
            
            const response = await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded', timeout: 30000 });
            expect(response.status()).toBe(200);

            // Wait for dynamic components if needed
            if (pageInfo.waitText) {
                await expect(page.locator('body')).toContainText(pageInfo.waitText, { timeout: 15000 });
            }

            // Verify Title
            await expect(page).toHaveTitle(pageInfo.title);

            // Verify Canonical
            const canonicalLocator = page.locator('link[rel="canonical"]');
            await expect(canonicalLocator).toHaveAttribute('href', pageInfo.canonical);

            // Verify OpenGraph URL
            const ogUrlLocator = page.locator('meta[property="og:url"]');
            await expect(ogUrlLocator).toHaveAttribute('content', pageInfo.canonical);

            // Verify exactly one Navbar and Footer
            const navCount = await page.locator('nav.fixed').count();
            expect(navCount).toBe(1);

            const footerCount = await page.locator('footer').count();
            expect(footerCount).toBe(1);

            // Verify absence of raw static block text or unwanted overlay copy
            const bodyText = await page.innerText('body');
            expect(bodyText).not.toContain('Tick Consent First');
            expect(bodyText).not.toContain('Accept Consent Checkboxes First');
        });
    }

    test('301 Redirect courtroom-battle -> nyaycourt-simulator', async ({ page }) => {
        console.log('=== Testing Redirect: /courtroom-battle ===');
        const response = await page.goto('/courtroom-battle', { waitUntil: 'domcontentloaded', timeout: 30000 });
        expect(page.url()).toContain('/nyaycourt-simulator');
    });
});
