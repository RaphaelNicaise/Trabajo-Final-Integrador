import api from './api';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const categoriesService = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
};
