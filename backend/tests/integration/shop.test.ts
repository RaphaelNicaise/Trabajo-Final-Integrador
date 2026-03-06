import request from 'supertest';
import { app } from '../../src/index';
import jwt from 'jsonwebtoken';

describe('Shops Integración', () => {
    const apiKey = process.env.INTERNAL_API_KEY || 'test_api_key';
    const jwtSecret = process.env.JWT_SECRET || 'test_secret_key_123';
    const uniqueSlug = `tienda-int-${Date.now()}`;
    let testUserId: string;
    let authToken: string;

    beforeAll(async () => {
        // Creamos un usuario real para que la creación de tienda no falle por "Usuario no encontrado"
        const { getMetaDB } = require('../../src/modules/database/tenantConnection');
        const { getModelByTenant } = require('../../src/modules/database/modelFactory');
        const { UserSchema } = require('../../src/modules/platform/models/user.schema');

        const metaDB = getMetaDB();
        const UserModel = getModelByTenant(metaDB, 'User', UserSchema);

        const user = new UserModel({
            name: 'Shop Owner Test',
            email: `shop_owner_${Date.now()}@example.com`,
            passwordHash: 'fake_hash',
            isConfirmed: true
        });
        await user.save();
        testUserId = user._id.toString();

        // Generamos un token JWT válido para las pruebas
        authToken = jwt.sign({ userId: testUserId }, jwtSecret, { expiresIn: '1h' });
    });

    it('debería fallar al crear una tienda sin API Key', async () => {
        const response = await request(app)
            .post('/api/shops')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                userId: testUserId,
                slug: uniqueSlug,
                storeName: 'Tienda sin Key'
            });

        expect(response.status).toBe(403);
        expect(response.body.message).toMatch(/falta api key/i);
    });

    it('debería fallar al crear una tienda sin Token JWT', async () => {
        const response = await request(app)
            .post('/api/shops')
            .set('x-api-key', apiKey)
            .send({
                userId: testUserId,
                slug: uniqueSlug,
                storeName: 'Tienda sin Token'
            });

        // El authGuard (si existe) o el controlador suelen pedir token
        expect(response.status).toBe(401);
    });

    it('debería crear una tienda exitosamente con API Key y Token JWT', async () => {
        const response = await request(app)
            .post('/api/shops')
            .set('x-api-key', apiKey)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                userId: testUserId,
                slug: uniqueSlug,
                storeName: 'Mi Tienda de Integración',
                location: 'Buenos Aires',
                description: 'Una tienda creada en tests de integración',
                categoria: 'Tecnología'
            });

        expect([200, 201]).toContain(response.status);
    });

    it('debería obtener la tienda creada por slug con API Key', async () => {
        const response = await request(app)
            .get(`/api/shops/${uniqueSlug}`)
            .set('x-api-key', apiKey);

        expect(response.status).toBe(200);
        expect(response.body.storeName).toBe('Mi Tienda de Integración');
    });

    it('debería devolver 404 para una tienda que no existe con API Key', async () => {
        const response = await request(app)
            .get('/api/shops/tienda-fantasma-999')
            .set('x-api-key', apiKey);

        expect(response.status).toBe(404);
    });
});
