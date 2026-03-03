import { calculateItemTotal, calculateUnitPrice, CartItem, CartItemPromotion } from '../../../src/contexts/CartContext';

describe('Funciones utilitarias del Carrito (CartContext)', () => {

    // ── calculateItemTotal ────────────────────────────────────────
    describe('calculateItemTotal', () => {
        const baseItem: CartItem = {
            productId: '1',
            name: 'Producto',
            price: 100,
            quantity: 3,
            shopSlug: 'test',
            shopName: 'Test',
        };

        it('debería calcular el total sin promoción', () => {
            const total = calculateItemTotal(baseItem);
            expect(total).toBe(300); // 100 * 3
        });

        it('debería calcular el total sin aplicar promoción inactiva', () => {
            const item: CartItem = {
                ...baseItem,
                promotion: { tipo: 'porcentaje', valor: 50, activa: false },
            };
            const total = calculateItemTotal(item);
            expect(total).toBe(300); // sin descuento
        });

        it('debería aplicar promoción de porcentaje', () => {
            const item: CartItem = {
                ...baseItem,
                promotion: { tipo: 'porcentaje', valor: 20, activa: true },
            };
            const total = calculateItemTotal(item);
            expect(total).toBe(240); // 100 * 3 * 0.80
        });

        it('debería aplicar promoción de descuento fijo', () => {
            const item: CartItem = {
                ...baseItem,
                promotion: { tipo: 'fijo', valor: 30, activa: true },
            };
            const total = calculateItemTotal(item);
            expect(total).toBe(210); // (100 - 30) * 3
        });

        it('debería limitar el total a 0 con descuento fijo mayor al precio', () => {
            const item: CartItem = {
                ...baseItem,
                promotion: { tipo: 'fijo', valor: 150, activa: true },
            };
            const total = calculateItemTotal(item);
            expect(total).toBe(0); // Math.max(0, 100-150) * 3 = 0
        });

        it('debería aplicar promoción NxM correctamente', () => {
            const item: CartItem = {
                ...baseItem,
                quantity: 7,
                promotion: { tipo: 'nxm', valor: 3, valor_secundario: 2, activa: true },
            };
            const total = calculateItemTotal(item);
            // 7 items: 2 grupos de 3 (paga 2 c/u) + 1 sobrante
            // (2 * 2 + 1) * 100 = 500
            expect(total).toBe(500);
        });

        it('debería usar llevas como pagas si valor_secundario no está definido en NxM', () => {
            const item: CartItem = {
                ...baseItem,
                quantity: 6,
                promotion: { tipo: 'nxm', valor: 3, activa: true },
            };
            const total = calculateItemTotal(item);
            // 6 items: 2 grupos de 3 (paga 3 c/u sin descuento)
            // (2 * 3 + 0) * 100 = 600
            expect(total).toBe(600);
        });
    });

    // ── calculateUnitPrice ────────────────────────────────────────
    describe('calculateUnitPrice', () => {
        it('debería retornar el precio original sin promoción', () => {
            expect(calculateUnitPrice(100)).toBe(100);
            expect(calculateUnitPrice(100, null)).toBe(100);
        });

        it('debería retornar el precio original con promoción inactiva', () => {
            const promo: CartItemPromotion = { tipo: 'porcentaje', valor: 50, activa: false };
            expect(calculateUnitPrice(100, promo)).toBe(100);
        });

        it('debería calcular precio unitario con descuento porcentual', () => {
            const promo: CartItemPromotion = { tipo: 'porcentaje', valor: 25, activa: true };
            expect(calculateUnitPrice(100, promo)).toBe(75);
        });

        it('debería calcular precio unitario con descuento fijo', () => {
            const promo: CartItemPromotion = { tipo: 'fijo', valor: 40, activa: true };
            expect(calculateUnitPrice(100, promo)).toBe(60);
        });

        it('debería limitar precio unitario fijo a 0', () => {
            const promo: CartItemPromotion = { tipo: 'fijo', valor: 200, activa: true };
            expect(calculateUnitPrice(100, promo)).toBe(0);
        });

        it('debería retornar el precio original para tipo NxM (se aplica a nivel de grupo)', () => {
            const promo: CartItemPromotion = { tipo: 'nxm', valor: 3, valor_secundario: 2, activa: true };
            expect(calculateUnitPrice(100, promo)).toBe(100);
        });
    });
});
