import request from 'supertest';
import { app } from '../../src/index';
import jwt from 'jsonwebtoken';

describe('Orders Integración', () => {
    const apiKey = process.env.INTERNAL_API_KEY || 'test_api_key';
    const jwtSecret = process.env.JWT_SECRET || 'test_secret_key_123';
    const tenantId = `tenant_order_${Date.now()}`;
    let authToken: string;
    let orderId: string;
    let productId: string;

    beforeAll(async () => {
        const userId = '507f1f77bcf86cd799439013';
        authToken = jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' });

        // CREAR UN PRODUCTO REAL PRIMERO PARA QUE EL PEDIDO TENGA STOCK
        // IMPORTANTE: El controlador de productos devuelve { data: product }
        const prodResponse = await request(app)
            .post('/api/products')
            .set('x-api-key', apiKey)
            .set('x-tenant-id', tenantId)
            .set('Authorization', `Bearer ${authToken}`)
            .field('name', 'Producto para Pedido')
            .field('price', '50')
            .field('stock', '100');

        if (prodResponse.status !== 201) {
            console.error('SETUP PRODUCT FAIL:', prodResponse.body);
        }

        productId = prodResponse.body.data._id;
    });

    it('debería crear un nuevo pedido (Ruta Pública de Cliente)', async () => {
        const response = await request(app)
            .post('/api/orders')
            .set('x-api-key', apiKey)
            .set('x-tenant-id', tenantId)
            .send({
                buyer: {
                    name: 'Juan Pérez',
                    email: 'juan@example.com',
                    phone: '123456789',
                    address: 'Calle Falsa 123',
                    city: 'Buenos Aires',
                    province: 'Buenos Aires',
                    postalCode: '1000'
                },
                products: [
                    {
                        productId: productId,
                        quantity: 2
                    }
                ],
                payment: {
                    method: 'Efectivo'
                },
                shipping: {
                    method: 'Envio a domicilio'
                }
            });

        if (response.status !== 201) {
            console.error('CREATE ORDER FAIL:', response.body);
        }

        expect(response.status).toBe(201);
        expect(response.body.data.buyer.name).toBe('Juan Pérez');
        orderId = response.body.data._id;
    });

    it('debería obtener la lista de pedidos (Panel Admin)', async () => {
        const response = await request(app)
            .get('/api/orders')
            .set('x-api-key', apiKey)
            .set('x-tenant-id', tenantId)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('debería actualizar el estado de un pedido', async () => {
        const response = await request(app)
            .put(`/api/orders/${orderId}`)
            .set('x-api-key', apiKey)
            .set('x-tenant-id', tenantId)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                status: 'Confirmado'
            });

        expect(response.status).toBe(200);
        expect(response.body.data.status).toBe('Confirmado');
    });
});
