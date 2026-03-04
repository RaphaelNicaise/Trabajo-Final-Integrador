import prodsSvc, { type Product } from '@/services/products.service';
import { HttpResponse, http } from 'msw';
import { setupIntegrationTest } from './setup';

// Setup MSW for this test file
const { server } = setupIntegrationTest();
const productsService = prodsSvc;

describe('Products Service Integration Tests', () => {
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
    it('debería obtener todos los productos del administrador', async () => {
      const result = await productsService.getAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('_id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('price');
    });

    it('debería tener la estructura correcta de producto', async () => {
      const result = await productsService.getAll();
      const product = result[0];

      const expectedProperties = ['_id', 'name', 'description', 'price', 'stock', 'status'];
      expectedProperties.forEach((prop) => {
        expect(product).toHaveProperty(prop);
      });
    });

    it('debería fallar si el servidor retorna error', async () => {
      server.use(
        http.get(`${API_URL}/products`, () => {
          return HttpResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
          );
        })
      );

      await expect(productsService.getAll()).rejects.toThrow();
    });
  });

  // ── getById Tests ──────────────────────────────────────────────────
  describe('getById', () => {
    it('debería obtener un producto por ID', async () => {
      const result = await productsService.getById('prod-123');

      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('stock');
    });

    it('debería fallar si el producto no existe', async () => {
      server.use(
        http.get(`${API_URL}/products/:id`, () => {
          return HttpResponse.json(
            { message: 'Producto no encontrado' },
            { status: 404 }
          );
        })
      );

      await expect(productsService.getById('nonexistent')).rejects.toThrow();
    });
  });

  // ── getPublicAll Tests ─────────────────────────────────────────────
  describe('getPublicAll', () => {
    it('debería obtener productos públicos', async () => {
      const result = await productsService.getPublicAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // ── create Tests ───────────────────────────────────────────────────
  describe('create', () => {
    it('debería crear un nuevo producto', async () => {
      const formData = new FormData();
      formData.append('name', 'Nuevo Producto');
      formData.append('description', 'Descripción del producto');
      formData.append('price', '100');
      formData.append('stock', '50');

      const result = await productsService.create(formData);

      expect(result).toHaveProperty('_id', 'prod-new');
      expect(result).toHaveProperty('name', 'Nuevo Producto');
      expect(result).toHaveProperty('status', 'Disponible');
    });

    it('debería fallar si faltan campos requeridos', async () => {
      server.use(
        http.post(`${API_URL}/products`, () => {
          return HttpResponse.json(
            { message: 'Campos requeridos faltantes' },
            { status: 400 }
          );
        })
      );

      const formData = new FormData();
      await expect(productsService.create(formData)).rejects.toThrow();
    });
  });

  // ── update Tests ───────────────────────────────────────────────────
  describe('update', () => {
    it('debería actualizar un producto existente', async () => {
      const formData = new FormData();
      formData.append('name', 'Producto Actualizado');
      formData.append('price', '150');

      const result = await productsService.update('prod-1', formData);

      expect(result).toHaveProperty('_id', 'prod-1');
      expect(result).toHaveProperty('name', 'Producto Actualizado');
    });
  });

  // ── delete Tests ───────────────────────────────────────────────────
  describe('delete', () => {
    it('debería eliminar un producto', async () => {
      const result = await productsService.delete('prod-1');

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('eliminado');
    });

    it('debería fallar al eliminar un producto inexistente', async () => {
      server.use(
        http.delete(`${API_URL}/products/:id`, () => {
          return HttpResponse.json(
            { message: 'Producto no encontrado' },
            { status: 404 }
          );
        })
      );

      await expect(productsService.delete('nonexistent')).rejects.toThrow();
    });
  });

  // ── Promotion Tests ────────────────────────────────────────────────
  describe('setPromotion', () => {
    it('debería aplicar una promoción de porcentaje al producto', async () => {
      const result = await productsService.setPromotion('prod-1', {
        tipo: 'porcentaje',
        valor: 20,
        activa: true,
      });

      expect(result).toHaveProperty('promotion');
      expect(result.promotion.tipo).toBe('porcentaje');
      expect(result.promotion.valor).toBe(20);
    });

    it('debería aplicar una promoción fija al producto', async () => {
      const result = await productsService.setPromotion('prod-1', {
        tipo: 'fijo',
        valor: 50,
      });

      expect(result.promotion.tipo).toBe('fijo');
      expect(result.promotion.valor).toBe(50);
    });

    it('debería aplicar una promoción nxm', async () => {
      const result = await productsService.setPromotion('prod-1', {
        tipo: 'nxm',
        valor: 3,
        valor_secundario: 2,
      });

      expect(result.promotion.tipo).toBe('nxm');
      expect(result.promotion.valor).toBe(3);
    });
  });

  describe('removePromotion', () => {
    it('debería remover la promoción de un producto', async () => {
      const result = await productsService.removePromotion('prod-1');

      expect(result).toHaveProperty('message');
      expect(result.promotion).toBeNull();
    });
  });
});
