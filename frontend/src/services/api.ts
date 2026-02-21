import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request: Inyecta JWT, x-tenant-id y x-api-key
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const activeShop = localStorage.getItem('activeShop');
    if (activeShop) {
      try {
        const shop = JSON.parse(activeShop);
        if (shop.slug) {
          config.headers['x-tenant-id'] = shop.slug;
        }
      } catch (error) {
        console.error('Error al parsear activeShop:', error);
      }
    }

    // Agregar API Key a todas las solicitudes
    const apiKey = process.env.NEXT_PUBLIC_INTERNAL_API_KEY;
    if (apiKey) {
      config.headers['x-api-key'] = apiKey;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response: Manejo de errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('activeShop');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
