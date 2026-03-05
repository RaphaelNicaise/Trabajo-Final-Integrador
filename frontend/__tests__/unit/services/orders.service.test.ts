import api from '../../../src/services/api';
import { ordersService } from '../../../src/services/orders.service';

jest.mock('../../../src/services/api');

const mockedApi = api as jest.Mocked<typeof api>;

describe('Servicio de Órdenes (OrdersService)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── getAll ─────────────────────────────────────────────────────
    describe('getAll', () => {
        it('debería llamar a GET /orders', async () => {
            const mockOrders = [{ _id: 'o1', total: 500, status: 'Pendiente' }];
            mockedApi.get.mockResolvedValueOnce({ data: mockOrders });

            const result = await ordersService.getAll();

            expect(mockedApi.get).toHaveBeenCalledWith('/orders');
            expect(result).toEqual(mockOrders);
        });
    });

    // ── getById ───────────────────────────────────────────────────
    describe('getById', () => {
        it('debería llamar a GET /orders/:id', async () => {
            const mockOrder = { _id: 'o1', total: 500 };
            mockedApi.get.mockResolvedValueOnce({ data: mockOrder });

            const result = await ordersService.getById('o1');

            expect(mockedApi.get).toHaveBeenCalledWith('/orders/o1');
            expect(result).toEqual(mockOrder);
        });
    });

    // ── updateStatus ──────────────────────────────────────────────
    describe('updateStatus', () => {
        it('debería enviar PUT a /orders/:id con el nuevo estado', async () => {
            mockedApi.put.mockResolvedValueOnce({ data: { status: 'Confirmado' } });

            const result = await ordersService.updateStatus('o1', 'Confirmado');

            expect(mockedApi.put).toHaveBeenCalledWith('/orders/o1', { status: 'Confirmado' });
            expect(result).toHaveProperty('status', 'Confirmado');
        });
    });

    // ── createOrder ───────────────────────────────────────────────
    describe('createOrder', () => {
        it('debería enviar POST a /orders con el header x-tenant-id', async () => {
            const orderData = { products: [{ productId: 'p1', quantity: 2 }], total: 200 };
            mockedApi.post.mockResolvedValueOnce({ data: { _id: 'o2', ...orderData } });

            const result = await ordersService.createOrder('mi-tienda', orderData);

            expect(mockedApi.post).toHaveBeenCalledWith('/orders', orderData, {
                headers: { 'x-tenant-id': 'mi-tienda' },
            });
            expect(result).toHaveProperty('_id', 'o2');
        });
    });

    // ── getShippingQuote ──────────────────────────────────────────
    describe('getShippingQuote', () => {
        it('debería enviar POST a /orders/shipping-quote con código postal y provincia', async () => {
            const mockQuote = { cost: 1500, estimatedDays: 3, method: 'Standard' };
            mockedApi.post.mockResolvedValueOnce({ data: mockQuote });

            const result = await ordersService.getShippingQuote('mi-tienda', '1425', 'CABA');

            expect(mockedApi.post).toHaveBeenCalledWith(
                '/orders/shipping-quote',
                { postalCode: '1425', province: 'CABA' },
                { headers: { 'x-tenant-id': 'mi-tienda' } }
            );
            expect(result).toEqual(mockQuote);
        });
    });

    // ── downloadPDF ───────────────────────────────────────────────
    describe('downloadPDF', () => {
        it('debería llamar a GET /orders/:id/pdf con responseType blob', async () => {
            const mockBlob = new Blob(['pdf-data']);
            mockedApi.get.mockResolvedValueOnce({ data: mockBlob });

            // Mock del DOM
            const mockLink = {
                href: '',
                setAttribute: jest.fn(),
                click: jest.fn(),
                remove: jest.fn(),
            };
            jest.spyOn(document, 'createElement').mockReturnValueOnce(mockLink as any);
            jest.spyOn(document.body, 'appendChild').mockImplementationOnce(() => mockLink as any);
            // JSDOM may not implement URL.revokeObjectURL or createObjectURL; ensure they're defined so we can spy on them
            if (!window.URL.revokeObjectURL) {
                Object.defineProperty(window.URL, 'revokeObjectURL', {
                    configurable: true,
                    value: jest.fn(),
                });
            }
            if (!window.URL.createObjectURL) {
                Object.defineProperty(window.URL, 'createObjectURL', {
                    configurable: true,
                    value: jest.fn(),
                });
            }
            const revokeURL = jest.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => { });
            jest.spyOn(window.URL, 'createObjectURL').mockReturnValueOnce('blob:fake-url');

            await ordersService.downloadPDF('abc12345');

            expect(mockedApi.get).toHaveBeenCalledWith('/orders/abc12345/pdf', {
                responseType: 'blob',
            });
            expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'orden-abc12345.pdf');
            expect(mockLink.click).toHaveBeenCalled();
            expect(mockLink.remove).toHaveBeenCalled();
            expect(revokeURL).toHaveBeenCalledWith('blob:fake-url');
        });
    });
});
