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
    { path: '/judge-ai', title: /Case analysis research|Judge AI/i, canonical: 'https://nyaynow.in/judge-ai', waitText: 'Outcome prediction is disabled' },
    { path: '/drafting', title: /Draft/i, canonical: 'https://nyaynow.in/drafting', waitText: 'Drafting Lab' },
    { path: '/nearby', title: /Nearby/i, canonical: 'https://nyaynow.in/nearby' },
    { path: '/nyaycourt-simulator', title: /Courtroom practice simulation|NyayCourt Simulator/i, canonical: 'https://nyaynow.in/nyaycourt-simulator' },
    { path: '/nyayvoice', title: /NyayVoice/i, canonical: 'https://nyaynow.in/nyayvoice' },
    { path: '/agreements', title: /Agreement Review|Evidence & Quantum Vault/i, canonical: 'https://nyaynow.in/agreements' }
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
