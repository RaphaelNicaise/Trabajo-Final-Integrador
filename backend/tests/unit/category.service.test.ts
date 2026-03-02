import { CategoryService } from '../../src/modules/categories/services/category.service';
import { CacheService } from '../../src/modules/cache/services/cache.service';
import { getTenantDB } from '../../src/modules/database/tenantConnection';
import { getModelByTenant } from '../../src/modules/database/modelFactory';

jest.mock('../../src/modules/database/tenantConnection');
jest.mock('../../src/modules/database/modelFactory');
jest.mock('../../src/modules/cache/services/cache.service');

describe('CategoryService', () => {
    let categoryService: CategoryService;
    const mockShopSlug = 'test-shop';
    const mockCategoryData = {
        name: 'Electrónica',
        slug: 'electronica'
    };

    const mockSave = jest.fn();
    const mockFind = jest.fn();
    const mockFindByIdAndUpdate = jest.fn();
    const mockFindByIdAndDelete = jest.fn();
    const mockUpdateMany = jest.fn();

    function MockModel(this: any, data: any) {
        Object.assign(this, data);
        this.save = mockSave;
    }
    MockModel.find = mockFind;
    MockModel.findByIdAndUpdate = mockFindByIdAndUpdate;
    MockModel.findByIdAndDelete = mockFindByIdAndDelete;
    MockModel.updateMany = mockUpdateMany;

    beforeEach(() => {
        jest.clearAllMocks();
        categoryService = new CategoryService();

        (getTenantDB as jest.Mock).mockReturnValue({});
        (getModelByTenant as jest.Mock).mockReturnValue(MockModel);

        mockFind.mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([mockCategoryData])
        });
    });

    describe('createCategory', () => {
        it('debería crear una categoría con slug automático e invalidar caché', async () => {
            mockSave.mockResolvedValue({ _id: 'cat1', ...mockCategoryData });

            const result = await categoryService.createCategory(mockShopSlug, { name: 'Electrónica' });

            expect(mockSave).toHaveBeenCalled();
            expect(result.slug).toBe('electronica');
            expect(CacheService.delete).toHaveBeenCalled();
        });
    });

    describe('getCategories', () => {
        it('debería retornar categorías desde la base de datos y guardarlas en caché', async () => {
            (CacheService.get as jest.Mock).mockResolvedValue(null);

            const result = await categoryService.getCategories(mockShopSlug);

            expect(mockFind).toHaveBeenCalled();
            expect(CacheService.set).toHaveBeenCalled();
            expect(result).toHaveLength(1);
        });

        it('debería retornar categorías desde la caché si están disponibles', async () => {
            (CacheService.get as jest.Mock).mockResolvedValue([mockCategoryData]);

            const result = await categoryService.getCategories(mockShopSlug);

            expect(mockFind).not.toHaveBeenCalled();
            expect(result).toHaveLength(1);
        });
    });

    describe('updateCategory', () => {
        it('debería actualizar la categoría e invalidar caché', async () => {
            mockFindByIdAndUpdate.mockResolvedValue({ ...mockCategoryData, name: 'Electro' });

            const result = await categoryService.updateCategory(mockShopSlug, 'cat1', { name: 'Electro' });

            expect(mockFindByIdAndUpdate).toHaveBeenCalled();
            expect(CacheService.delete).toHaveBeenCalled();
            expect(result?.name).toBe('Electro');
        });
    });

    describe('deleteCategory', () => {
        it('debería desvincular productos antes de eliminar la categoría e invalidar caché', async () => {
            mockFindByIdAndDelete.mockResolvedValue(mockCategoryData);

            await categoryService.deleteCategory(mockShopSlug, 'cat1');

            expect(mockUpdateMany).toHaveBeenCalledWith(
                { categories: 'cat1' },
                { $pull: { categories: 'cat1' } }
            );
            expect(mockFindByIdAndDelete).toHaveBeenCalledWith('cat1');
            expect(CacheService.delete).toHaveBeenCalled();
        });
    });
});
