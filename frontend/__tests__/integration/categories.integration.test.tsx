import catsSvc from '@/services/categories.service';
import { HttpResponse, http } from 'msw';
import { setupIntegrationTest } from './setup';

// Setup MSW for this test file
const { server } = setupIntegrationTest();
const categoriesService = catsSvc;

describe('Categories Service Integration Tests', () => {
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
    it('debería obtener todas las categorías', async () => {
      const result = await categoriesService.getAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('_id');
      expect(result[0]).toHaveProperty('name');
    });

    it('debería tener la estructura correcta de categoría', async () => {
      const result = await categoriesService.getAll();
      const category = result[0];

      const expectedProperties = ['_id', 'name', 'createdAt'];
      expectedProperties.forEach((prop) => {
        expect(category).toHaveProperty(prop);
      });
    });

    it('debería fallar si el servidor retorna error', async () => {
      server.use(
        http.get(`${API_URL}/categories`, () => {
          return HttpResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
          );
        })
      );

      await expect(categoriesService.getAll()).rejects.toThrow();
    });
  });

  // ── getById Tests ──────────────────────────────────────────────────
  describe('getById', () => {
    it('debería obtener una categoría por ID', async () => {
      server.use(
        http.get(`${API_URL}/categories/:id`, ({ params }) => {
          return HttpResponse.json({
            _id: params.id,
            name: 'Categoría Test',
            createdAt: new Date().toISOString(),
          });
        })
      );

      const result = await categoriesService.getById('cat-123');

      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('name');
    });

    it('debería fallar si la categoría no existe', async () => {
      server.use(
        http.get(`${API_URL}/categories/:id`, () => {
          return HttpResponse.json(
            { message: 'Categoría no encontrada' },
            { status: 404 }
          );
        })
      );

      await expect(categoriesService.getById('nonexistent')).rejects.toThrow();
    });
  });

  // ── create Tests ───────────────────────────────────────────────────
  describe('create', () => {
    it('debería crear una nueva categoría', async () => {
      const result = await categoriesService.create({ name: 'Nueva Categoría' });

      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('name', 'Nueva Categoría');
      expect(result).toHaveProperty('slug');
    });

    it('debería fallar si el nombre de categoría ya existe', async () => {
      server.use(
        http.post(`${API_URL}/categories`, () => {
          return HttpResponse.json(
            { message: 'La categoría ya existe' },
            { status: 409 }
          );
        })
      );

      await expect(
        categoriesService.create({ name: 'Categoría Existente' })
      ).rejects.toThrow();
    });

    it('debería fallar sin autenticación', async () => {
      localStorage.removeItem('token');

      server.use(
        http.post(`${API_URL}/categories`, () => {
          return HttpResponse.json(
            { message: 'No autorizado' },
            { status: 401 }
          );
        })
      );

      await expect(
        categoriesService.create({ name: 'Nueva Categoría' })
      ).rejects.toThrow();
    });

    it('debería fallar sin nombre', async () => {
      server.use(
        http.post(`${API_URL}/categories`, () => {
          return HttpResponse.json(
            { message: 'El nombre es requerido' },
            { status: 400 }
          );
        })
      );

      await expect(
        categoriesService.create({ name: '' })
      ).rejects.toThrow();
    });
  });

  // ── update Tests ───────────────────────────────────────────────────
  describe('update', () => {
    it('debería actualizar una categoría existente', async () => {
      server.use(
        http.put(`${API_URL}/categories/:id`, async ({ request }) => {
          const body = (await request.json()) as any;
          return HttpResponse.json({
            _id: 'cat-1',
            name: body.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        })
      );

      const result = await categoriesService.update('cat-1', {
        name: 'Categoría Actualizada',
      });

      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('name', 'Categoría Actualizada');
    });

    it('debería fallar si la categoría no existe', async () => {
      server.use(
        http.put(`${API_URL}/categories/:id`, () => {
          return HttpResponse.json(
            { message: 'Categoría no encontrada' },
            { status: 404 }
          );
        })
      );

      await expect(
        categoriesService.update('nonexistent', { name: 'New Name' })
      ).rejects.toThrow();
    });
  });

  // ── delete Tests ───────────────────────────────────────────────────
  describe('delete', () => {
    it('debería eliminar una categoría', async () => {
      server.use(
        http.delete(`${API_URL}/categories/:id`, () => {
          return HttpResponse.json({
            message: 'Categoría eliminada exitosamente',
          });
        })
      );

      const result = await categoriesService.delete('cat-1');

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('eliminada');
    });

    it('debería fallar si intenta eliminar categoría con productos', async () => {
      server.use(
        http.delete(`${API_URL}/categories/:id`, () => {
          return HttpResponse.json(
            { message: 'No puedes eliminar una categoría con productos' },
            { status: 400 }
          );
        })
      );

      await expect(
        categoriesService.delete('cat-with-products')
      ).rejects.toThrow();
    });

    it('debería fallar sin autenticación', async () => {
      localStorage.removeItem('token');

      server.use(
        http.delete(`${API_URL}/categories/:id`, () => {
          return HttpResponse.json(
            { message: 'No autorizado' },
            { status: 401 }
          );
        })
      );

      await expect(categoriesService.delete('cat-1')).rejects.toThrow();
    });
  });
});
