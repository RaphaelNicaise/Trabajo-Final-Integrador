import { test, expect } from '@playwright/test';

test.describe('Flujo completo de visualización de tiendas', () => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

    test.beforeEach(async ({ page }) => {
        await page.goto(baseURL);
    });

    test('Debería poder ver una tienda y entrar al hacer click en ella', async ({ page }) => {
        await page.click('text=Tienda Test');

        const heading = page.locator('h1');
        await expect(heading).toHaveText('Tienda Test');
    });
});
