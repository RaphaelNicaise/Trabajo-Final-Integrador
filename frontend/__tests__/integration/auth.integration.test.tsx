import authSvc from '@/services/auth.service';
import { HttpResponse, http } from 'msw';
import { setupIntegrationTest } from './setup';

// Setup MSW for this test file
const { server } = setupIntegrationTest();

describe('Auth Service Integration Tests', () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api';

const authService = authSvc;

  describe('register', () => {
    it('debería registrarse exitosamente con datos válidos', async () => {
      const result = await authService.register(
        'John Doe',
        'john@example.com',
        'password123'
      );

      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('email', 'john@example.com');
      expect(result).toHaveProperty('isConfirmed', false);
    });

    it('debería fallar si el email ya existe', async () => {
      await expect(
        authService.register('Jane Doe', 'existing@example.com', 'password123')
      ).rejects.toThrow('El email ya está registrado');
    });

    it('debería fallar si hay error en la red', async () => {
      server.use(
        http.post(`${API_URL}/auth/register`, () => {
          return HttpResponse.error();
        })
      );

      await expect(
        authService.register('John', 'john@example.com', 'pass123')
      ).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('debería iniciar sesión exitosamente con credenciales válidas', async () => {
      const result = await authService.login('test@example.com', 'password123');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('email', 'test@example.com');
    });

    it('debería fallar con credenciales inválidas', async () => {
      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Credenciales inválidas');
    });

    it('debería fallar si la cuenta no está confirmada', async () => {
      await expect(
        authService.login('unconfirmed@example.com', 'password123')
      ).rejects.toThrow('Cuenta no confirmada');
    });
  });

  describe('confirmAccount', () => {
    it('debería confirmar la cuenta con token válido', async () => {
      const result = await authService.confirmAccount('valid-token-123');

      expect(result).toHaveProperty('message', 'Cuenta confirmada exitosamente');
      expect(result.user).toHaveProperty('isConfirmed', true);
    });

    it('debería fallar con token inválido', async () => {
      server.use(
        http.get(`${API_URL}/auth/confirm/:token`, () => {
          return HttpResponse.json(
            { message: 'Token inválido o expirado' },
            { status: 400 }
          );
        })
      );

      await expect(
        authService.confirmAccount('invalid-token')
      ).rejects.toThrow();
    });
  });

  describe('forgotPassword', () => {
    it('debería enviar email de recuperación exitosamente', async () => {
      const result = await authService.forgotPassword('test@example.com');

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('correo');
    });

    it('debería fallar si el servicio de email está down', async () => {
      server.use(
        http.post(`${API_URL}/auth/forgot-password`, () => {
          return HttpResponse.json(
            { message: 'Servicio de email no disponible' },
            { status: 503 }
          );
        })
      );

      await expect(
        authService.forgotPassword('test@example.com')
      ).rejects.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('debería resetear la contraseña exitosamente', async () => {
      const result = await authService.resetPassword('token-123', 'newpass123');

      expect(result).toHaveProperty('message', 'Contraseña restablecida exitosamente');
    });

    it('debería fallar con token expirado', async () => {
      server.use(
        http.post(`${API_URL}/auth/reset-password/:token`, () => {
          return HttpResponse.json(
            { message: 'Token expirado' },
            { status: 401 }
          );
        })
      );

      await expect(
        authService.resetPassword('expired-token', 'newpass123')
      ).rejects.toThrow();
    });
  });

  describe('acceptInvitation', () => {
    it('debería aceptar invitación exitosamente', async () => {
      const result = await authService.acceptInvitation('invite-token-123');

      expect(result).toHaveProperty('message', 'Invitación aceptada');
      expect(result).toHaveProperty('shop');
    });

    it('debería fallar con token inválido', async () => {
      server.use(
        http.post(`${API_URL}/shops/invitations/:token/accept`, () => {
          return HttpResponse.json(
            { message: 'Invitación no encontrada o expirada' },
            { status: 404 }
          );
        })
      );

      await expect(
        authService.acceptInvitation('invalid-token')
      ).rejects.toThrow();
    });
  });
});
