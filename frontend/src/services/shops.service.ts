import api from './api';

export const shopsService = {
  getUserShops: async (userId: string) => {
    const response = await api.get(`/shops/user/${userId}`);
    
    // Mapear la respuesta del backend a la estructura esperada
    return response.data.map((shop: any) => ({
      id: shop.tenantId || shop._id,
      slug: shop.slug,
      name: shop.storeName,
      location: shop.location,
      description: shop.description,
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
};
