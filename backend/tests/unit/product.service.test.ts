import { ProductService } from '../../src/modules/products/services/product.service';
import { CacheService } from '../../src/modules/cache/services/cache.service';
import { getTenantDB } from '../../src/modules/database/tenantConnection';
import { getModelByTenant } from '../../src/modules/database/modelFactory';

jest.mock('../../src/modules/database/tenantConnection');
jest.mock('../../src/modules/database/modelFactory');
jest.mock('../../src/modules/cache/services/cache.service');

describe('ProductService', () => {
    let productService: ProductService;
    const mockShopSlug = 'test-shop';
    const mockProductData = {
        name: 'Producto de prueba',
        price: 100,
        stock: 10,
        status: 'Disponible'
    };

    const mockSave = jest.fn();
    const mockFind = jest.fn();
    const mockFindById = jest.fn();
    const mockFindByIdAndUpdate = jest.fn();
    const mockFindByIdAndDelete = jest.fn();

    function MockModel(this: any, data: any) {
        Object.assign(this, data);
        this.save = mockSave;
    }
    MockModel.find = mockFind;
    MockModel.findById = mockFindById;
    MockModel.findByIdAndUpdate = mockFindByIdAndUpdate;
    MockModel.findByIdAndDelete = mockFindByIdAndDelete;

    beforeEach(() => {
        jest.clearAllMocks();
        productService = new ProductService();

        (getTenantDB as jest.Mock).mockReturnValue({});
        (getModelByTenant as jest.Mock).mockReturnValue(MockModel);

        mockFind.mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([mockProductData])
        });

        mockFindById.mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockProductData)
        });
    });

    describe('createProduct', () => {
        it('debería guardar un nuevo producto e invalidar la caché', async () => {
            mockSave.mockResolvedValue({ _id: '123', ...mockProductData });

            const result = await productService.createProduct(mockShopSlug, mockProductData as any);

            expect(mockSave).toHaveBeenCalled();
            expect(CacheService.delete).toHaveBeenCalledWith(expect.stringContaining(mockShopSlug));
            expect(result._id).toBe('123');
        });
    });

    describe('updateProduct (Pruebas de lógica)', () => {
        it('debería cambiar automáticamente el estado a "Agotado" si el stock es 0', async () => {
            const updateData = { stock: 0 };
            mockFindById.mockReturnValue({
                lean: jest.fn().mockResolvedValue({ ...mockProductData, status: 'Disponible' })
            });
            mockFindByIdAndUpdate.mockResolvedValue({ ...mockProductData, stock: 0, status: 'Agotado' });

            await productService.updateProduct(mockShopSlug, '123', updateData);

            expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
                '123',
                expect.objectContaining({ status: 'Agotado' }),
                expect.any(Object)
            );
        });

        it('debería restaurar el estado a "Disponible" si el stock aumenta y estaba "Agotado"', async () => {
            const updateData = { stock: 5 };
            mockFindById.mockReturnValue({
                lean: jest.fn().mockResolvedValue({ ...mockProductData, stock: 0, status: 'Agotado' })
            });
            mockFindByIdAndUpdate.mockResolvedValue({ ...mockProductData, stock: 5, status: 'Disponible' });

            await productService.updateProduct(mockShopSlug, '123', updateData);

            expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
                '123',
                expect.objectContaining({ status: 'Disponible' }),
                expect.any(Object)
            );
        });

        it('NO debería restaurar el estado a "Disponible" si fue marcado como "No disponible" manualmente', async () => {
            const updateData = { stock: 5 };
            mockFindById.mockReturnValue({
                lean: jest.fn().mockResolvedValue({ ...mockProductData, status: 'No disponible' })
            });
            mockFindByIdAndUpdate.mockResolvedValue({ ...mockProductData, stock: 5, status: 'No disponible' });

            await productService.updateProduct(mockShopSlug, '123', updateData);

            const callArgs = mockFindByIdAndUpdate.mock.calls[0][1];
            expect(callArgs.status).toBeUndefined();
        });
    });

    describe('deleteProduct', () => {
        it('debería eliminar el producto e invalidar la caché', async () => {
            mockFindByIdAndDelete.mockResolvedValue(mockProductData);

            await productService.deleteProduct(mockShopSlug, '123');

            expect(mockFindByIdAndDelete).toHaveBeenCalledWith('123');
            expect(CacheService.delete).toHaveBeenCalled();
        });
    });
});
