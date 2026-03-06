import api from '../../../src/services/api';
import { productsService } from '../../../src/services/products.service';

jest.mock('../../../src/services/api');

const mockedApi = api as jest.Mocked<typeof api>;

describe('Servicio de Productos (ProductsService)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── getAll ─────────────────────────────────────────────────────
    describe('getAll', () => {
        it('debería llamar a GET /products', async () => {
            const mockProducts = [{ _id: '1', name: 'Producto A', price: 100 }];
            mockedApi.get.mockResolvedValueOnce({ data: mockProducts });

            const result = await productsService.getAll();

            expect(mockedApi.get).toHaveBeenCalledWith('/products');
            expect(result).toEqual(mockProducts);
        });

        it('debería retornar arreglo vacío si no hay productos', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: [] });

            const result = await productsService.getAll();

            expect(result).toEqual([]);
        });
    });

    // ── getPublicAll ──────────────────────────────────────────────
    describe('getPublicAll', () => {
        it('debería llamar a GET /products?public=true', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: [{ _id: '1' }] });

            await productsService.getPublicAll();

            expect(mockedApi.get).toHaveBeenCalledWith('/products?public=true');
        });
    });

    // ── getById ───────────────────────────────────────────────────
    describe('getById', () => {
        it('debería llamar a GET /products/:id sin parámetros extra', async () => {
            const mockProduct = { _id: '42', name: 'Producto X' };
            mockedApi.get.mockResolvedValueOnce({ data: mockProduct });

            const result = await productsService.getById('42');

            expect(mockedApi.get).toHaveBeenCalledWith('/products/42', undefined);
            expect(result).toEqual(mockProduct);
        });

        it('debería incluir el slug de la tienda como parámetro de query', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: { _id: '42' } });

            await productsService.getById('42', 'mi-tienda');

            expect(mockedApi.get).toHaveBeenCalledWith('/products/42', {
                params: { shop: 'mi-tienda' },
            });
        });
    });

    // ── create ────────────────────────────────────────────────────
    describe('create', () => {
        it('debería enviar FormData al endpoint con Content-Type multipart/form-data', async () => {
            const formData = new FormData();
            formData.append('name', 'Nuevo');
            formData.append('price', '500');
            const mockResponse = { _id: '2', name: 'Nuevo' };
            mockedApi.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await productsService.create(formData);

            expect(mockedApi.post).toHaveBeenCalledWith('/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            expect(result).toEqual(mockResponse);
        });
    });

    // ── update ────────────────────────────────────────────────────
    describe('update', () => {
        it('debería enviar PUT a /products/:id con FormData', async () => {
            const formData = new FormData();
            formData.append('name', 'Editado');
            mockedApi.put.mockResolvedValueOnce({ data: { _id: '1', name: 'Editado' } });

            const result = await productsService.update('1', formData);

            expect(mockedApi.put).toHaveBeenCalledWith('/products/1', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            expect(result).toHaveProperty('name', 'Editado');
        });
    });

    // ── delete ────────────────────────────────────────────────────
    describe('delete', () => {
        it('debería enviar DELETE a /products/:id', async () => {
            mockedApi.delete.mockResolvedValueOnce({ data: { message: 'Eliminado' } });

            const result = await productsService.delete('99');

            expect(mockedApi.delete).toHaveBeenCalledWith('/products/99');
            expect(result).toEqual({ message: 'Eliminado' });
        });
    });

    // ── Promociones ───────────────────────────────────────────────
    describe('Promociones', () => {
        it('debería enviar PUT a /products/:id/promotion con los datos de la promoción', async () => {
            const promo = { tipo: 'porcentaje' as const, valor: 15 };
            mockedApi.put.mockResolvedValueOnce({ data: { message: 'Promoción aplicada' } });

            const result = await productsService.setPromotion('1', promo);

            expect(mockedApi.put).toHaveBeenCalledWith('/products/1/promotion', promo);
            expect(result).toEqual({ message: 'Promoción aplicada' });
        });

        it('debería enviar DELETE a /products/:id/promotion', async () => {
            mockedApi.delete.mockResolvedValueOnce({ data: { message: 'Promoción eliminada' } });

            const result = await productsService.removePromotion('1');

            expect(mockedApi.delete).toHaveBeenCalledWith('/products/1/promotion');
            expect(result).toEqual({ message: 'Promoción eliminada' });
        });

        it('debería obtener productos con promociones activas', async () => {
            const mockData = [{ _id: '1', promotion: { activa: true } }];
            mockedApi.get.mockResolvedValueOnce({ data: mockData });

            const result = await productsService.getWithPromotions();

            expect(mockedApi.get).toHaveBeenCalledWith('/products/promotions');
            expect(result).toEqual(mockData);
        });
    });
});
