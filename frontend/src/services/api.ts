import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api';

// Instancia principal de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request: Inyecta JWT y x-tenant-id
api.interceptors.request.use(
  (config) => {
    // Inyectar token JWT
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Inyectar x-tenant-id si hay una tienda activa
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
      // Token inválido o expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('activeShop');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
