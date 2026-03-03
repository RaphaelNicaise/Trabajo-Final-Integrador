import request from 'supertest';
import { app } from '../../src/index';
import jwt from 'jsonwebtoken';

describe('Categories Integración', () => {
    const apiKey = process.env.INTERNAL_API_KEY || 'test_api_key';
    const jwtSecret = process.env.JWT_SECRET || 'test_secret_key_123';
    const tenantId = `tenant_${Date.now()}`;
    let authToken: string;
    let categoryId: string;

    beforeAll(async () => {
        // Simular un userId para el token
        const userId = '507f1f77bcf86cd799439011';
        authToken = jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' });
    });

    it('debería crear una categoría con éxito (Ruta Protegida)', async () => {
        const response = await request(app)
            .post('/api/categories')
            .set('x-api-key', apiKey)
            .set('x-tenant-id', tenantId)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: 'Categoría de Prueba',
                description: 'Descripción de prueba'
            });

        if (response.status !== 201) {
            console.error('CREATE CATEGORY FAIL:', response.body);
        }

        expect(response.status).toBe(201);
        expect(response.body.name).toBe('Categoría de Prueba');
        expect(response.body).toHaveProperty('_id');
        categoryId = response.body._id;
        console.log(`CATEGORY ID CAPTURADO: ${categoryId}`);
        expect(categoryId).toBeDefined();
    });

    it('debería obtener todas las categorías del tenant (Ruta Pública con tenantId)', async () => {
        const response = await request(app)
            .get('/api/categories')
            .set('x-api-key', apiKey)
            .set('x-tenant-id', tenantId);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.some((c: any) => c._id === categoryId)).toBe(true);
    });

    it('debería actualizar una categoría', async () => {
        console.log(`ACTUALIZANDO CATEGORY: ${categoryId}`);
        const response = await request(app)
            .put(`/api/categories/${categoryId}`)
            .set('x-api-key', apiKey)
            .set('x-tenant-id', tenantId)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: 'Categoría Actualizada'
            });

        if (response.status !== 200) {
            console.error('UPDATE CATEGORY FAIL:', response.body);
        }

        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Categoría Actualizada');
    });

    it('debería fallar al intentar borrar sin token', async () => {
        const response = await request(app)
            .delete(`/api/categories/${categoryId}`)
            .set('x-api-key', apiKey)
            .set('x-tenant-id', tenantId);

        expect(response.status).toBe(401);
    });

    it('debería borrar una categoría con éxito', async () => {
        const response = await request(app)
            .delete(`/api/categories/${categoryId}`)
            .set('x-api-key', apiKey)
            .set('x-tenant-id', tenantId)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toMatch(/eliminada/i);
    });
});
