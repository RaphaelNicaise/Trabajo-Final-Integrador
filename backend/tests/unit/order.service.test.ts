import { OrderService } from '../../src/modules/orders/services/order.service';
import { MailService } from '../../src/modules/mail/services/mail.service';
import { getTenantDB } from '../../src/modules/database/tenantConnection';
import { getModelByTenant } from '../../src/modules/database/modelFactory';

// Mocks
jest.mock('../../src/modules/database/tenantConnection');
jest.mock('../../src/modules/database/modelFactory');
jest.mock('../../src/modules/mail/services/mail.service');

describe('OrderService', () => {
    let orderService: OrderService;
    const mockShopSlug = 'test-shop';
    const mockOrderData = {
        buyer: { name: 'Comprador', email: 'comprador@test.com' },
        products: [{ productId: 'prod1', quantity: 2 }],
        shipping: { cost: 500, method: 'Estándar' }
    };

    const mockProductDb = {
        _id: 'prod1',
        name: 'Producto 1',
        price: 1000,
        stock: 10,
        description: 'Desc',
        imageUrl: 'url'
    };

    const mockSave = jest.fn();
    const mockFindById = jest.fn();
    const mockFindByIdAndUpdate = jest.fn();
    const mockFind = jest.fn();

    function MockOrderModel(this: any, data: any) {
        Object.assign(this, data);
        this.save = mockSave;
    }
    MockOrderModel.find = mockFind;
    MockOrderModel.findById = mockFindById;

    beforeEach(() => {
        jest.clearAllMocks();
        orderService = new OrderService();

        (getTenantDB as jest.Mock).mockReturnValue({});
        (getModelByTenant as jest.Mock).mockImplementation((conn, name) => {
            if (name === 'Order') return MockOrderModel;
            if (name === 'Product') {
                return {
                    findById: mockFindById,
                    findByIdAndUpdate: mockFindByIdAndUpdate
                };
            }
            return {};
        });

        (MailService.notifyNewOrder as jest.Mock).mockResolvedValue({});
        (MailService.sendOrderConfirmationToBuyer as jest.Mock).mockResolvedValue({});
    });

    describe('simulateShippingQuote', () => {
        it('debería calcular el costo de envío correctamente para Buenos Aires', () => {
            const result = orderService.simulateShippingQuote('1000', 'Buenos Aires');
            expect(result.cost).toBe(1500);
            expect(result.method).toBe('Envío Estándar');
        });

        it('debería calcular un costo mayor para Tierra del Fuego', () => {
            const result = orderService.simulateShippingQuote('9410', 'Tierra del Fuego');
            expect(result.cost).toBeGreaterThan(1500);
        });
    });

    describe('createOrder', () => {
        it('debería crear una orden, descontar stock y enviar emails', async () => {
            mockFindById.mockResolvedValue(mockProductDb);
            mockSave.mockResolvedValue({ _id: 'order123', ...mockOrderData, total: 2500 });

            const result = await orderService.createOrder(mockShopSlug, mockOrderData);

            expect(mockFindById).toHaveBeenCalledWith('prod1');
            expect(mockFindByIdAndUpdate).toHaveBeenCalledWith('prod1', { $inc: { stock: -2 } });
            expect(mockSave).toHaveBeenCalled();
            expect(MailService.notifyNewOrder).toHaveBeenCalled();
            expect(result.total).toBe(2500); // (1000 * 2) + 500
        });

        it('debería lanzar error si no hay stock suficiente', async () => {
            mockFindById.mockResolvedValue({ ...mockProductDb, stock: 1 });

            await expect(orderService.createOrder(mockShopSlug, mockOrderData))
                .rejects.toThrow('Stock insuficiente');
        });
    });

    describe('updateOrderStatus', () => {
        it('debería devolver el stock si la orden se cancela', async () => {
            const mockOrder = {
                _id: 'order1',
                status: 'Confirmado',
                products: [{ productId: 'prod1', quantity: 2 }],
                save: mockSave
            };
            mockFindById.mockResolvedValue(mockOrder);

            await orderService.updateOrderStatus(mockShopSlug, 'order1', 'Cancelado');

            expect(mockFindByIdAndUpdate).toHaveBeenCalledWith('prod1', { $inc: { stock: 2 } });
            expect(mockOrder.status).toBe('Cancelado');
            expect(mockSave).toHaveBeenCalled();
        });
    });
});
