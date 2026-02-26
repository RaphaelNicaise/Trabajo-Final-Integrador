import api from './api';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error al iniciar sesión. Verifica tus credenciales.';
      throw new Error(message);
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      return response.data;
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error al registrarse.';
      throw new Error(message);
    }
  },

  confirmAccount: async (token: string) => {
    try {
      const response = await api.get(`/auth/confirm/${token}`);
      return response.data;
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error al confirmar la cuenta.';
      throw new Error(message);
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error al procesar la solicitud.';
      throw new Error(message);
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error al restablecer la contraseña.';
      throw new Error(message);
    }
  },

  acceptInvitation: async (token: string) => {
    try {
      const response = await api.post(`/shops/invitations/${token}/accept`);
      return response.data;
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error al aceptar la invitación.';
      throw new Error(message);
    }
  },
};
