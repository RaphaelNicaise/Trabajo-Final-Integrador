import shopsSvc from '@/services/shops.service';
import { HttpResponse, http } from 'msw';
import { setupIntegrationTest } from './setup';

// Setup MSW for this test file
const { server } = setupIntegrationTest();
const shopsService = shopsSvc;

describe('Shops Service Integration Tests', () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api';

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'mock-jwt-token');
  });

  // ── getBySlug Tests ────────────────────────────────────────────────
  describe('getBySlug', () => {
    it('debería obtener una tienda por slug', async () => {
      const result = await shopsService.getBySlug('test-shop');

      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('name', 'Mi Tienda');
      expect(result).toHaveProperty('slug', 'test-shop');
      expect(result).toHaveProperty('description');
    });

    it('debería fallar si la tienda no existe', async () => {
      server.use(
        http.get(`${API_URL}/shops/:slug`, () => {
          return HttpResponse.json(
            { message: 'Tienda no encontrada' },
            { status: 404 }
          );
        })
      );

      await expect(shopsService.getBySlug('nonexistent')).rejects.toThrow();
    });

    it('debería retornar un objeto con propiedades esperadas', async () => {
      const result = await shopsService.getBySlug('my-store');

      const expectedProperties = ['_id', 'name', 'slug', 'description'];
      expectedProperties.forEach((prop) => {
        expect(result).toHaveProperty(prop);
      });
    });
  });

  // ── create Tests ───────────────────────────────────────────────────
  describe('create', () => {
    it('debería crear una nueva tienda exitosamente', async () => {
      const result = await shopsService.create({
        name: 'Nueva Tienda',
        slug: 'nueva-tienda',
        description: 'Una tienda nueva',
      });

      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('name', 'Nueva Tienda');
      expect(result).toHaveProperty('slug');
    });

    it('debería generar slug automáticamente si no se proporciona', async () => {
      const result = await shopsService.create({
        name: 'Mi Super Tienda',
        description: 'Descripción',
      });

      expect(result).toHaveProperty('slug');
      expect(result.slug).toBeTruthy();
    });

    it('debería fallar si el nombre ya existe', async () => {
      server.use(
        http.post(`${API_URL}/shops`, () => {
          return HttpResponse.json(
            { message: 'Ya existe una tienda con ese nombre' },
            { status: 409 }
          );
        })
      );

      await expect(
        shopsService.create({
          name: 'Tienda Existente',
          description: 'Descripción',
        })
      ).rejects.toThrow();
    });

    it('debería fallar sin token de autenticación', async () => {
      localStorage.removeItem('token');

      server.use(
        http.post(`${API_URL}/shops`, () => {
          return HttpResponse.json(
            { message: 'No autorizado' },
            { status: 401 }
          );
        })
      );

      await expect(
        shopsService.create({
          name: 'Nueva Tienda',
          description: 'Descripción',
        })
      ).rejects.toThrow();
    });
  });

  // ── update Tests ───────────────────────────────────────────────────
  describe('update', () => {
    it('debería actualizar una tienda existente', async () => {
      server.use(
        http.put(`${API_URL}/shops/:id`, async ({ request }) => {
          const body = (await request.json()) as any;
          return HttpResponse.json({
            _id: 'shop-123',
            name: body.name,
            slug: 'test-shop',
            description: body.description,
          });
        })
      );

      const result = await shopsService.update('shop-123', {
        name: 'Tienda Actualizada',
        description: 'Nueva descripción',
      });

      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('name', 'Tienda Actualizada');
    });
  });

  // ── getAll Tests ───────────────────────────────────────────────────
  describe('getAll', () => {
    it('debería obtener todas las tiendas del usuario', async () => {
      server.use(
        http.get(`${API_URL}/shops`, () => {
          return HttpResponse.json([
            {
              _id: 'shop-1',
              name: 'Tienda 1',
              slug: 'tienda-1',
            },
            {
              _id: 'shop-2',
              name: 'Tienda 2',
              slug: 'tienda-2',
            },
          ]);
        })
      );

      const result = await shopsService.getAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // ── delete Tests ───────────────────────────────────────────────────
  describe('delete', () => {
    it('debería eliminar una tienda', async () => {
      server.use(
        http.delete(`${API_URL}/shops/:id`, () => {
          return HttpResponse.json({
            message: 'Tienda eliminada exitosamente',
          });
        })
      );

      const result = await shopsService.delete('shop-123');

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('eliminada');
    });

    it('debería fallar si intenta eliminar tienda que no le pertenece', async () => {
      server.use(
        http.delete(`${API_URL}/shops/:id`, () => {
          return HttpResponse.json(
            { message: 'No tienes permisos para eliminar esta tienda' },
            { status: 403 }
          );
        })
      );

      await expect(shopsService.delete('other-shop')).rejects.toThrow();
    });
  });
});
