import { test, expect } from '@playwright/test';

test.describe('Test Básico Local', () => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

    test('La página principal carga y muestra StoreHub', async ({ page }) => {
        await page.goto(baseURL);
        const logo = page.locator('text=StoreHub').first();
        await expect(logo).toBeVisible();

        await expect(page).toHaveURL(`${baseURL}/`);
    });

    test('Debería poder navegar a una tienda, agregar productos al carrito y ver el contador actualizarse', async ({ page }) => {
        await page.goto(baseURL);

        await page.click('text=Tienda Test');

        const botonesAgregar = page.locator('button:has-text("Agregar")');
        await expect(botonesAgregar.first()).toBeVisible();

        await botonesAgregar.nth(0).click();

        const contadorCarrito = page.locator('button.fixed.bottom-6.right-6 span');
        await expect(contadorCarrito).toHaveText('1');

        await botonesAgregar.nth(1).click();

        await expect(contadorCarrito).toHaveText('2');
    });
});
