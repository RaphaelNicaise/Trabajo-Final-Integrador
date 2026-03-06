import { test, expect } from '@playwright/test';

test.describe('Navegación, Búsqueda y Login', () => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

    test.beforeEach(async ({ page }) => {
        await page.goto(baseURL);
    });

    test('Debería poder buscar una tienda por texto', async ({ page }) => {
        const searchInput = page.getByPlaceholder(/Buscar tiendas por nombre/i);
        await searchInput.fill('Tienda');

        const tarjetaTiendaTest = page.getByText('Tienda Test');
        await expect(tarjetaTiendaTest).toBeVisible();
    });

    test('Debería poder usar el filtro de categorías', async ({ page }) => {
        //const categoriaBoton = page.getByRole('button', { name: /Todas las categorías/i });
        const selectCats = page.locator('select');
        if (await selectCats.count() > 0) {
            await selectCats.selectOption({ label: 'Todas las categorías' });
            const tarjetaTiendaTest = page.getByText('Tienda Test');
            await expect(tarjetaTiendaTest).toBeVisible();
        }
    });

    test('Debería poder navegar a la pantalla de Login', async ({ page }) => {
        const btnIngresar = page.getByRole('link', { name: 'Ingresar' });
        await btnIngresar.click();

        await expect(page).toHaveURL(/.*login/);

        const inputEmail = page.locator('#email');
        const inputPass = page.locator('#password');
        const btnSubmit = page.getByRole('button', { name: 'Iniciar Sesión' });

        await expect(inputEmail).toBeVisible();
        await expect(inputPass).toBeVisible();
        await expect(btnSubmit).toBeVisible();
    });
});
