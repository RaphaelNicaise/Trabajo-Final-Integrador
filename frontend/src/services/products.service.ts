import api from './api';

export interface ProductPromotion {
  tipo: 'porcentaje' | 'fijo' | 'nxm';
  valor: number;
  valor_secundario?: number | null;
  activa: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categories?: string[];
  promotion?: ProductPromotion | null;
  createdAt: string;
  updatedAt: string;
}

export const productsService = {
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (productData: FormData) => {
    const response = await api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, productData: FormData) => {
    const response = await api.put(`/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // ── Promociones ─────────────────────────────────────────────────
  setPromotion: async (productId: string, promotion: Omit<ProductPromotion, 'activa'> & { activa?: boolean }) => {
    const response = await api.put(`/products/${productId}/promotion`, promotion);
    return response.data;
  },

  removePromotion: async (productId: string) => {
    const response = await api.delete(`/products/${productId}/promotion`);
    return response.data;
  },

  getWithPromotions: async () => {
    const response = await api.get('/products/promotions');
    return response.data;
  },
};
