import api from '../../../src/services/api';
import { shopsService } from '../../../src/services/shops.service';

jest.mock('../../../src/services/api');

const mockedApi = api as jest.Mocked<typeof api>;

describe('Servicio de Tiendas (ShopsService)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── getUserShops ──────────────────────────────────────────────
    describe('getUserShops', () => {
        it('debería llamar a GET /shops/user/:userId', async () => {
            mockedApi.get.mockResolvedValueOnce({
                data: [{ _id: '1', storeName: 'Tienda A', slug: 'tienda-a', tenantId: 'db_a', role: 'owner' }],
            });

            await shopsService.getUserShops('user-1');

            expect(mockedApi.get).toHaveBeenCalledWith('/shops/user/user-1');
        });

        it('debería transformar la respuesta mapeando los campos correctamente', async () => {
            mockedApi.get.mockResolvedValueOnce({
                data: [{
                    _id: '1',
                    storeName: 'Tienda A',
                    slug: 'tienda-a',
                    tenantId: 'db_a',
                    location: 'Buenos Aires',
                    description: 'Descripción',
                    imageUrl: 'http://img.com/logo.png',
                    role: 'owner',
                }],
            });

            const result = await shopsService.getUserShops('user-1');

            expect(result[0]).toEqual({
                id: 'db_a',
                slug: 'tienda-a',
                name: 'Tienda A',
                location: 'Buenos Aires',
                description: 'Descripción',
                imageUrl: 'http://img.com/logo.png',
                role: 'owner',
            });
        });

        it('debería usar _id si tenantId no existe', async () => {
            mockedApi.get.mockResolvedValueOnce({
                data: [{ _id: 'fallback-id', storeName: 'T', slug: 's' }],
            });

            const result = await shopsService.getUserShops('user-1');

            expect(result[0].id).toBe('fallback-id');
        });
    });

    // ── getAllShops ────────────────────────────────────────────────
    describe('getAllShops', () => {
        it('debería llamar a GET /shops y transformar la respuesta', async () => {
            mockedApi.get.mockResolvedValueOnce({
                data: [{ _id: '1', storeName: 'Tienda B', slug: 'tienda-b', categoria: 'ropa' }],
            });

            const result = await shopsService.getAllShops();

            expect(mockedApi.get).toHaveBeenCalledWith('/shops');
            expect(result[0]).toMatchObject({
                name: 'Tienda B',
                slug: 'tienda-b',
                categoria: 'ropa',
            });
        });

        it('debería asignar string vacío a categoria si no viene del servidor', async () => {
            mockedApi.get.mockResolvedValueOnce({
                data: [{ _id: '1', storeName: 'T', slug: 's' }],
            });

            const result = await shopsService.getAllShops();

            expect(result[0].categoria).toBe('');
        });
    });

    // ── getShopBySlug ─────────────────────────────────────────────
    describe('getShopBySlug', () => {
        it('debería llamar a GET /shops/:slug', async () => {
            const mockShop = { _id: '1', storeName: 'T', slug: 'test' };
            mockedApi.get.mockResolvedValueOnce({ data: mockShop });

            const result = await shopsService.getShopBySlug('test');

            expect(mockedApi.get).toHaveBeenCalledWith('/shops/test');
            expect(result).toEqual(mockShop);
        });
    });

    // ── createShop ────────────────────────────────────────────────
    describe('createShop', () => {
        it('debería enviar POST a /shops con los datos de la tienda', async () => {
            const shopData = { userId: 'u1', storeName: 'Nueva', slug: 'nueva' };
            mockedApi.post.mockResolvedValueOnce({ data: { _id: '2', ...shopData } });

            const result = await shopsService.createShop(shopData);

            expect(mockedApi.post).toHaveBeenCalledWith('/shops', shopData);
            expect(result).toHaveProperty('_id', '2');
        });
    });

    // ── updateShop ────────────────────────────────────────────────
    describe('updateShop', () => {
        it('debería enviar PUT a /shops/:slug con los datos a actualizar', async () => {
            const updates = { storeName: 'Actualizada' };
            mockedApi.put.mockResolvedValueOnce({ data: { ...updates, slug: 'test' } });

            const result = await shopsService.updateShop('test', updates);

            expect(mockedApi.put).toHaveBeenCalledWith('/shops/test', updates);
            expect(result).toMatchObject({ storeName: 'Actualizada' });
        });
    });

    // ── deleteShop ────────────────────────────────────────────────
    describe('deleteShop', () => {
        it('debería enviar DELETE a /shops/:slug', async () => {
            mockedApi.delete.mockResolvedValueOnce({ data: { message: 'Eliminada' } });

            const result = await shopsService.deleteShop('test');

            expect(mockedApi.delete).toHaveBeenCalledWith('/shops/test');
            expect(result).toEqual({ message: 'Eliminada' });
        });
    });

    // ── uploadShopLogo ────────────────────────────────────────────
    describe('uploadShopLogo', () => {
        it('debería enviar POST a /shops/:slug/logo con FormData', async () => {
            const file = new File(['logo'], 'logo.png', { type: 'image/png' });
            mockedApi.post.mockResolvedValueOnce({ data: { imageUrl: 'http://minio/logo.png' } });

            const result = await shopsService.uploadShopLogo('test', file);

            expect(mockedApi.post).toHaveBeenCalledTimes(1);
            const [url, body, config] = mockedApi.post.mock.calls[0];
            expect(url).toBe('/shops/test/logo');
            expect(body).toBeInstanceOf(FormData);
            expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
            expect(result).toEqual({ imageUrl: 'http://minio/logo.png' });
        });
    });

    // ── Miembros ──────────────────────────────────────────────────
    describe('Gestión de miembros', () => {
        it('debería obtener los miembros de una tienda', async () => {
            const mockMembers = [{ userId: 'u1', email: 'a@b.c', role: 'editor' }];
            mockedApi.get.mockResolvedValueOnce({ data: mockMembers });

            const result = await shopsService.getMembers('test');

            expect(mockedApi.get).toHaveBeenCalledWith('/shops/test/members');
            expect(result).toEqual(mockMembers);
        });

        it('debería agregar un miembro por email', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: { message: 'Invitación enviada' } });

            const result = await shopsService.addMember('test', 'nuevo@mail.com');

            expect(mockedApi.post).toHaveBeenCalledWith('/shops/test/members', { email: 'nuevo@mail.com' });
            expect(result).toEqual({ message: 'Invitación enviada' });
        });

        it('debería eliminar un miembro por userId', async () => {
            mockedApi.delete.mockResolvedValueOnce({ data: { message: 'Miembro eliminado' } });

            const result = await shopsService.removeMember('test', 'user-99');

            expect(mockedApi.delete).toHaveBeenCalledWith('/shops/test/members/user-99');
            expect(result).toEqual({ message: 'Miembro eliminado' });
        });
    });
});
