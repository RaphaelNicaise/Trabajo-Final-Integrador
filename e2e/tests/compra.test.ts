import { test, expect } from '@playwright/test';

test.describe('Flujo de Checkout (Compra)', () => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

    test('Debería poder completar una compra en Tienda Test', async ({ page }) => {
        await page.goto(baseURL);
        await page.click('text=Tienda Test');

        const botonesAgregar = page.locator('button:has-text("Agregar")');
        await expect(botonesAgregar.first()).toBeVisible();
        await botonesAgregar.nth(0).click();

        const btnCarrito = page.locator('button.fixed.bottom-6.right-6');
        await btnCarrito.click();

        const btnCheckout = page.getByRole('link', { name: /Proceder al Checkout/i });
        await btnCheckout.click();

        await expect(page.getByRole('heading', { name: 'Información Personal' })).toBeVisible();

        await page.getByPlaceholder('Juan Pérez').fill('Comprador Test');
        await page.getByPlaceholder('+54 9 11 1234-5678').fill('1122334455');
        await page.getByPlaceholder('tu@email.com').fill('test@comprador.com');

        await page.getByRole('button', { name: /Siguiente/i }).click();

        await expect(page.getByRole('heading', { name: 'Dirección de Envío' })).toBeVisible();
        const provinciaSelect = page.locator('select').first();
        await expect(provinciaSelect).toBeEnabled({ timeout: 10000 });
        await provinciaSelect.selectOption({ index: 1 });

        const ciudadSelect = page.locator('select').nth(1);
        await expect(ciudadSelect).toBeEnabled({ timeout: 10000 });
        await ciudadSelect.selectOption({ index: 1 });

        await page.getByPlaceholder('Av. Siempre Viva').fill('Calle Falsa');
        await page.getByPlaceholder('742').fill('123');
        await page.getByPlaceholder('1234').fill('1000');

        await page.getByRole('button', { name: /Siguiente/i }).click();

        await expect(page.getByRole('heading', { name: 'Información de Pago' })).toBeVisible();
        await page.getByPlaceholder('4242 4242 4242 4242').fill('4242424242424242');
        await page.getByPlaceholder('JUAN PEREZ').fill('COMPRADOR TEST');
        await page.getByPlaceholder('MM/AA').fill('12/28');
        await page.getByPlaceholder('123').fill('123');

        await page.getByRole('button', { name: /Siguiente/i }).click();

        await expect(page.getByRole('heading', { name: 'Confirmación del Pedido' })).toBeVisible();
        await page.getByRole('button', { name: /Confirmar y Pagar/i }).click();

        await expect(page.getByRole('heading', { name: '¡Orden Confirmada!' })).toBeVisible({ timeout: 15000 });
    });
});
