import api from './api';

export interface Order {
  _id: string;
  buyer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    streetNumber: string;
    city: string;
    province: string;
    postalCode: string;
    notes?: string;
  };
  products: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  shipping: {
    cost: number;
    estimatedDays: number;
    method: string;
  };
  payment: {
    method: string;
    cardLastFour: string;
    cardHolder: string;
    status: string;
  };
  total: number;
  status: 'Pendiente' | 'Confirmado' | 'Enviado' | 'Cancelado';
  createdAt: string;
  updatedAt: string;
}

export interface ShippingQuote {
  cost: number;
  estimatedDays: number;
  method: string;
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

  getShippingQuote: async (slug: string, postalCode: string, province: string): Promise<ShippingQuote> => {
    const response = await api.post(`/orders/shipping-quote`, { postalCode, province }, {
      headers: {
        'x-tenant-id': slug
      }
    });
    return response.data;
  },

  downloadPDF: async (id: string) => {
    const response = await api.get(`/orders/${id}/pdf`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `orden-${id.slice(-8)}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
