import api from './api';

export const shopsService = {
  getUserShops: async (userId: string) => {
    const response = await api.get(`/shops/user/${userId}`);
    return response.data.map((shop: any) => ({
      id: shop.tenantId || shop._id,
      slug: shop.slug,
      name: shop.storeName,
      location: shop.location,
      description: shop.description,
      imageUrl: shop.imageUrl,
      role: shop.role
    }));
  },

  createShop: async (shopData: {
    userId: string;
    storeName: string;
    slug: string;
    location?: string;
    description?: string;
  }) => {
    const response = await api.post('/shops', shopData);
    return response.data;
  },

  getShopBySlug: async (slug: string) => {
    const response = await api.get(`/shops/${slug}`);
    return response.data;
  },

  updateShop: async (slug: string, shopData: {
    storeName?: string;
    location?: string;
    description?: string;
  }) => {
    const response = await api.put(`/shops/${slug}`, shopData);
    return response.data;
  },

  deleteShop: async (slug: string) => {
    const response = await api.delete(`/shops/${slug}`);
    return response.data;
  },

  getAllShops: async () => {
    const response = await api.get('/shops');
    return response.data;
  },

  uploadShopLogo: async (slug: string, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await api.post(`/shops/${slug}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
};
