import request from 'supertest';
import { app } from '../../src/index';

describe('Auth Integración', () => {
    const testUser = {
        name: 'Test Integration User',
        email: `test_int_${Date.now()}@example.com`,
        password: 'Password123!'
    };

    it('debería registrar un nuevo usuario exitosamente', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(response.status).toBe(201);
        expect(response.body.user.email).toBe(testUser.email);
        expect(response.body.user).toHaveProperty('_id');
    });

    it('debería fallar al intentar registrar el mismo email dos veces', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(response.status).toBe(409);
        expect(response.body.error).toMatch(/registrado/i);
    });

    it('debería fallar login con password incorrecto para un usuario existente', async () => {
        // Primero confirmamos al usuario en la DB para que el login pueda avanzar hasta la validación de password
        const { getMetaDB } = require('../../src/modules/database/tenantConnection');
        const { getModelByTenant } = require('../../src/modules/database/modelFactory');
        const { UserSchema } = require('../../src/modules/platform/models/user.schema');

        const metaDB = getMetaDB();
        const UserModel = getModelByTenant(metaDB, 'User', UserSchema);
        await UserModel.updateOne({ email: testUser.email }, { isConfirmed: true });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'WrongPassword123'
            });

        expect(response.status).toBe(401);
        expect(response.body.error).toMatch(/inválidas/i);
    });
});


