import api from '../../../src/services/api';
import { categoriesService } from '../../../src/services/categories.service';

jest.mock('../../../src/services/api');

const mockedApi = api as jest.Mocked<typeof api>;

describe('Servicio de Categorías (CategoriesService)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── getAll ─────────────────────────────────────────────────────
    describe('getAll', () => {
        it('debería llamar a GET /categories y retornar las categorías', async () => {
            const mockCategories = [
                { _id: '1', name: 'Electrónica' },
                { _id: '2', name: 'Ropa' },
            ];
            mockedApi.get.mockResolvedValueOnce({ data: mockCategories });

            const result = await categoriesService.getAll();

            expect(mockedApi.get).toHaveBeenCalledWith('/categories');
            expect(result).toEqual(mockCategories);
            expect(result).toHaveLength(2);
        });
    });

    // ── getById ───────────────────────────────────────────────────
    describe('getById', () => {
        it('debería llamar a GET /categories/:id', async () => {
            const mockCategory = { _id: '1', name: 'Electrónica' };
            mockedApi.get.mockResolvedValueOnce({ data: mockCategory });

            const result = await categoriesService.getById('1');

            expect(mockedApi.get).toHaveBeenCalledWith('/categories/1');
            expect(result).toEqual(mockCategory);
        });
    });

    // ── create ────────────────────────────────────────────────────
    describe('create', () => {
        it('debería enviar POST a /categories con el nombre', async () => {
            const newCat = { name: 'Deportes' };
            mockedApi.post.mockResolvedValueOnce({ data: { _id: '3', ...newCat } });

            const result = await categoriesService.create(newCat);

            expect(mockedApi.post).toHaveBeenCalledWith('/categories', newCat);
            expect(result).toHaveProperty('name', 'Deportes');
        });
    });

    // ── update ────────────────────────────────────────────────────
    describe('update', () => {
        it('debería enviar PUT a /categories/:id con el nuevo nombre', async () => {
            const updatedCat = { name: 'Electrónica y Tech' };
            mockedApi.put.mockResolvedValueOnce({ data: { _id: '1', ...updatedCat } });

            const result = await categoriesService.update('1', updatedCat);

            expect(mockedApi.put).toHaveBeenCalledWith('/categories/1', updatedCat);
            expect(result).toHaveProperty('name', 'Electrónica y Tech');
        });
    });

    // ── delete ────────────────────────────────────────────────────
    describe('delete', () => {
        it('debería enviar DELETE a /categories/:id', async () => {
            mockedApi.delete.mockResolvedValueOnce({ data: { message: 'Categoría eliminada' } });

            const result = await categoriesService.delete('1');

            expect(mockedApi.delete).toHaveBeenCalledWith('/categories/1');
            expect(result).toEqual({ message: 'Categoría eliminada' });
        });
    });
});
