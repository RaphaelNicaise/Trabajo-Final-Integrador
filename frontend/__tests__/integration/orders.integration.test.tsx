import ordersSvc from '@/services/orders.service';
import { HttpResponse, http } from 'msw';
import { setupIntegrationTest } from './setup';

// Setup MSW for this test file
const { server } = setupIntegrationTest();
const ordersService = ordersSvc;

describe('Orders Service Integration Tests', () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api';

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem(
      'activeShop',
      JSON.stringify({
        slug: 'test-shop',
        _id: 'shop-123',
      })
    );
  });

  // ── getAll Tests ───────────────────────────────────────────────────
  describe('getAll', () => {
    it('debería obtener todas las órdenes', async () => {
      const result = await ordersService.getAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('_id');
      expect(result[0]).toHaveProperty('status');
      expect(result[0]).toHaveProperty('total');
    });

    it('debería tener la estructura correcta de orden', async () => {
      const result = await ordersService.getAll();
      const order = result[0];

      const expectedProperties = ['_id', 'total', 'status'];
      expectedProperties.forEach((prop) => {
        expect(order).toHaveProperty(prop);
      });
    });

    it('debería fallar si no hay autenticación', async () => {
      localStorage.removeItem('token');

      server.use(
        http.get(`${API_URL}/orders`, () => {
          return HttpResponse.json(
            { message: 'No autorizado' },
            { status: 401 }
          );
        })
      );

      await expect(ordersService.getAll()).rejects.toThrow();
    });
  });

  // ── getById Tests ──────────────────────────────────────────────────
  describe('getById', () => {
    it('debería obtener una orden por ID', async () => {
      const result = await ordersService.getById('order-123');

      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('items');
    });

    it('debería fallar si la orden no existe', async () => {
      server.use(
        http.get(`${API_URL}/orders/:id`, () => {
          return HttpResponse.json(
            { message: 'Orden no encontrada' },
            { status: 404 }
          );
        })
      );

      await expect(ordersService.getById('nonexistent')).rejects.toThrow();
    });
  });

  // ── createOrder Tests ──────────────────────────────────────────────
  describe('createOrder', () => {
    it('debería crear una nueva orden exitosamente', async () => {
      const orderData = {
        products: [{ productId: 'prod-1', quantity: 2 }],
        total: 200,
      };

      const result = await ordersService.createOrder('test-shop', orderData as any);

      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('status', 'Pendiente');
      expect(result).toHaveProperty('total', 200);
    });

    it('debería fallar sin x-tenant-id', async () => {
      localStorage.removeItem('activeShop');

      const orderData = {
        products: [{ productId: 'prod-1', quantity: 2 }],
        total: 200,
      };

      // Sin activeShop en localStorage, no se enviará x-tenant-id
      await expect(
        ordersService.createOrder('test-shop', orderData as any)
      ).rejects.toThrow();
    });

    it('debería fallar si hay stock insuficiente', async () => {
      server.use(
        http.post(`${API_URL}/orders`, () => {
          return HttpResponse.json(
            { message: 'Stock insuficiente para este producto' },
            { status: 400 }
          );
        })
      );

      const orderData = {
        products: [{ productId: 'prod-99', quantity: 999 }],
        total: 99900,
      };

      await expect(
        ordersService.createOrder('test-shop', orderData as any)
      ).rejects.toThrow();
    });
  });

  // ── updateStatus Tests ─────────────────────────────────────────────
  describe('updateStatus', () => {
    it('debería actualizar el estado de una orden', async () => {
      const result = await ordersService.updateStatus('order-1', 'Confirmado');

      expect(result).toHaveProperty('status', 'Confirmado');
      expect(result).toHaveProperty('message', 'Estado actualizado');
    });

    it('debería fallar con estado inválido', async () => {
      server.use(
        http.put(`${API_URL}/orders/:id`, () => {
          return HttpResponse.json(
            { message: 'Estado inválido' },
            { status: 400 }
          );
        })
      );

      await expect(
        ordersService.updateStatus('order-1', 'EstadoInvalido' as any)
      ).rejects.toThrow();
    });

    it('debería fallar si no tiene permisos', async () => {
      server.use(
        http.put(`${API_URL}/orders/:id`, () => {
          return HttpResponse.json(
            { message: 'No tienes permisos para actualizar esta orden' },
            { status: 403 }
          );
        })
      );

      await expect(
        ordersService.updateStatus('other-order', 'Confirmado')
      ).rejects.toThrow();
    });
  });

  // ── getShippingQuote Tests ─────────────────────────────────────────
  describe('getShippingQuote', () => {
    it('debería obtener cotización de envío para Buenos Aires', async () => {
      const result = await ordersService.getShippingQuote(
        'test-shop',
        '1425',
        'CABA'
      );

      expect(result).toHaveProperty('cost');
      expect(result).toHaveProperty('estimatedDays');
      expect(result).toHaveProperty('method');
      expect(result.province).toBe('CABA');
    });

    it('debería obtener cotización de envío para provincias lejanas', async () => {
      const result = await ordersService.getShippingQuote(
        'test-shop',
        '9410',
        'Tierra del Fuego'
      );

      expect(result).toHaveProperty('cost');
      expect(result.cost).toBeGreaterThan(0);
    });

    it('debería fallar con código postal inválido', async () => {
      server.use(
        http.post(`${API_URL}/orders/shipping-quote`, () => {
          return HttpResponse.json(
            { message: 'Código postal inválido' },
            { status: 400 }
          );
        })
      );

      await expect(
        ordersService.getShippingQuote('test-shop', '00000', 'Invalid')
      ).rejects.toThrow();
    });

    it('debería fallar sin x-tenant-id', async () => {
      localStorage.removeItem('activeShop');

      await expect(
        ordersService.getShippingQuote('test-shop', '1425', 'CABA')
      ).rejects.toThrow();
    });
  });

  // ── downloadPDF Tests ──────────────────────────────────────────────
  describe('downloadPDF', () => {
    it('debería descargar PDF de la orden', async () => {
      // Mock del DOM
      const mockLink = {
        href: '',
        setAttribute: jest.fn(),
        click: jest.fn(),
        remove: jest.fn(),
      };

      jest.spyOn(document, 'createElement').mockReturnValueOnce(mockLink as any);
      jest.spyOn(document.body, 'appendChild').mockImplementationOnce(() => mockLink as any);

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

      const revokeURL = jest.spyOn(window.URL, 'revokeObjectURL');
      jest.spyOn(window.URL, 'createObjectURL').mockReturnValueOnce('blob:fake-url');

      await ordersService.downloadPDF('order-123');

      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        'download',
        expect.stringContaining('.pdf')
      );
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.remove).toHaveBeenCalled();
    });

    it('debería fallar si la orden no existe', async () => {
      server.use(
        http.get(`${API_URL}/orders/:id/pdf`, () => {
          return HttpResponse.json(
            { message: 'Orden no encontrada' },
            { status: 404 }
          );
        })
      );

      // Mock del DOM para evitar errores
      const mockLink = {
        href: '',
        setAttribute: jest.fn(),
        click: jest.fn(),
        remove: jest.fn(),
      };
      jest.spyOn(document, 'createElement').mockReturnValueOnce(mockLink as any);

      await expect(ordersService.downloadPDF('nonexistent')).rejects.toThrow();
    });
  });
});
