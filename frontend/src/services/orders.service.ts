import api from './api';

export interface Order {
  _id: string;
  buyer: {
    name: string;
    email: string;
    address: string;
    postalCode: string;
  };
  products: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: 'Pendiente' | 'Pagado' | 'Enviado' | 'Cancelado';
  createdAt: string;
  updatedAt: string;
}

export const ordersService = {
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.put(`/orders/${id}`, { status });
    return response.data;
  },

  createOrder: async (slug: string, orderData: any) => {
    const response = await api.post(`/orders`, orderData, {
      headers: {
        'x-tenant-id': slug
      }
    });
    return response.data;
  },
};
