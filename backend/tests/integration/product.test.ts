import request from 'supertest';
import { app } from '../../src/index';
import jwt from 'jsonwebtoken';

describe('Products Integración', () => {
    const apiKey = process.env.INTERNAL_API_KEY || 'test_api_key';
    const jwtSecret = process.env.JWT_SECRET || 'test_secret_key_123';
    const tenantId = `tenant_prod_${Date.now()}`;
    let authToken: string;
    let productId: string;

    beforeAll(async () => {
        const userId = '507f1f77bcf86cd799439012';
        authToken = jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' });
    });

    it('debería crear un producto exitosamente', async () => {
        const response = await request(app)
            .post('/api/products')
            .set('x-api-key', apiKey)
            .set('x-tenant-id', tenantId)
            .set('Authorization', `Bearer ${authToken}`)
            .field('name', 'Producto de Prueba')
            .field('price', '100')
            .field('description', 'Descripción del producto')
            .field('stock', '10');

        if (response.status !== 201) {
            console.error('CREATE PRODUCT FAIL:', response.body);
        }

        expect(response.status).toBe(201);
        expect(response.body.data.name).toBe('Producto de Prueba');
        productId = response.body.data._id;
        expect(productId).toBeDefined();
    });

    it('debería listar los productos del tenant', async () => {
        const response = await request(app)
            .get('/api/products')
            .set('x-api-key', apiKey)
            .set('x-tenant-id', tenantId);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it('debería aplicar una promoción al producto', async () => {
        // El controlador deconstruye directamente de req.body: { tipo, valor, valor_secundario, activa }
        const response = await request(app)
            .put(`/api/products/${productId}/promotion`)
            .set('x-api-key', apiKey)
            .set('x-tenant-id', tenantId)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                tipo: 'porcentaje',
                valor: 20,
                activa: true
            });

        if (response.status !== 200) {
            console.error('PROMOTION FAIL:', response.body);
        }

        expect(response.status).toBe(200);
        expect(response.body.data.promotion.valor).toBe(20);
        expect(response.body.data.promotion.tipo).toBe('porcentaje');
    });

    it('debería eliminar el producto', async () => {
        const response = await request(app)
            .delete(`/api/products/${productId}`)
            .set('x-api-key', apiKey)
            .set('x-tenant-id', tenantId)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toMatch(/eliminado/i);
    });
});
