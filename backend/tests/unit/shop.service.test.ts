// PRIMERO LOS MOCKS (Para evitar que Jest intente cargar módulos ESM reales)
jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));
jest.mock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn().mockImplementation(() => ({
        send: jest.fn()
    })),
    PutObjectCommand: jest.fn(),
    CreateBucketCommand: jest.fn(),
    PutBucketPolicyCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
    DeleteObjectsCommand: jest.fn(),
    ListObjectsV2Command: jest.fn()
}));

import { ShopService } from '../../src/modules/shops/services/shop.service';
import { CacheService } from '../../src/modules/cache/services/cache.service';
import { getMetaDB } from '../../src/modules/database/tenantConnection';
import { getModelByTenant } from '../../src/modules/database/modelFactory';

jest.mock('../../src/modules/database/tenantConnection');
jest.mock('../../src/modules/database/modelFactory');
jest.mock('../../src/modules/cache/services/cache.service');
jest.mock('../../src/modules/storage/services/storage.service');
jest.mock('../../src/modules/mail/services/mail.service');
jest.mock('../../src/modules/mail/templates/shopInvitation.template', () => ({
    shopInvitationTemplate: jest.fn().mockReturnValue('<html></html>')
}));

describe('ShopService', () => {
    let shopService: ShopService;
    const mockShopData = {
        slug: 'test-shop',
        storeName: 'Tienda de Prueba'
    };

    const mockFindOne = jest.fn();

    function MockModel(this: any, data: any) {
        Object.assign(this, data);
        this.save = jest.fn().mockResolvedValue(this);
    }
    MockModel.findOne = mockFindOne;

    beforeEach(() => {
        jest.clearAllMocks();
        shopService = new ShopService();

        (getMetaDB as jest.Mock).mockReturnValue({});
        (getModelByTenant as jest.Mock).mockReturnValue(MockModel);

        mockFindOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockShopData)
        });
    });

    it('debería poder instanciarse correctamente', () => {
        expect(shopService).toBeDefined();
    });

    describe('getShopBySlug', () => {
        it('debería retornar la tienda desde la caché si existe', async () => {
            (CacheService.get as jest.Mock).mockResolvedValue(mockShopData);

            const result = await shopService.getShopBySlug('test-shop');

            expect(result).toEqual(mockShopData);
            expect(CacheService.get).toHaveBeenCalled();
        });

        it('debería buscar en la base de datos si no está en caché', async () => {
            (CacheService.get as jest.Mock).mockResolvedValue(null);

            const result = await shopService.getShopBySlug('test-shop');

            expect(result).toEqual(mockShopData);
            expect(mockFindOne).toHaveBeenCalled();
        });
    });
});
