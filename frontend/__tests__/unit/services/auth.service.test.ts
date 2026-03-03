import api from '../../../src/services/api';
import { authService } from '../../../src/services/auth.service';

jest.mock('../../../src/services/api');

const mockedApi = api as jest.Mocked<typeof api>;

describe('Servicio de Autenticación (AuthService)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── Login ──────────────────────────────────────────────────────
    describe('login', () => {
        it('debería enviar las credenciales al endpoint correcto', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: { token: 'jwt' } });

            await authService.login('user@mail.com', 'pass123');

            expect(mockedApi.post).toHaveBeenCalledTimes(1);
            expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', {
                email: 'user@mail.com',
                password: 'pass123',
            });
        });

        it('debería retornar token y usuario cuando el login es exitoso', async () => {
            const mockData = { token: 'fake-jwt', user: { id: '1', name: 'Test' } };
            mockedApi.post.mockResolvedValueOnce({ data: mockData });

            const result = await authService.login('user@mail.com', 'pass123');

            expect(result).toEqual(mockData);
        });

        it('debería lanzar error con el mensaje del servidor (campo error)', async () => {
            mockedApi.post.mockRejectedValueOnce({
                response: { data: { error: 'Credenciales inválidas' } },
            });

            await expect(authService.login('user@mail.com', 'bad'))
                .rejects.toThrow('Credenciales inválidas');
        });

        it('debería lanzar error con el mensaje del servidor (campo message)', async () => {
            mockedApi.post.mockRejectedValueOnce({
                response: { data: { message: 'Usuario no encontrado' } },
            });

            await expect(authService.login('noexiste@mail.com', 'pass'))
                .rejects.toThrow('Usuario no encontrado');
        });

        it('debería usar mensaje por defecto si el servidor no envía detalle', async () => {
            mockedApi.post.mockRejectedValueOnce({
                response: { data: {} },
            });

            await expect(authService.login('user@mail.com', 'pass'))
                .rejects.toThrow('Error al iniciar sesión. Verifica tus credenciales.');
        });

        it('debería usar mensaje por defecto si no hay response (error de red)', async () => {
            mockedApi.post.mockRejectedValueOnce(new Error('Network Error'));

            await expect(authService.login('user@mail.com', 'pass'))
                .rejects.toThrow('Error al iniciar sesión. Verifica tus credenciales.');
        });
    });

    // ── Register ──────────────────────────────────────────────────
    describe('register', () => {
        it('debería enviar nombre, email y contraseña al endpoint correcto', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: { message: 'ok' } });

            await authService.register('Juan', 'juan@mail.com', 'pass123');

            expect(mockedApi.post).toHaveBeenCalledWith('/auth/register', {
                name: 'Juan',
                email: 'juan@mail.com',
                password: 'pass123',
            });
        });

        it('debería retornar los datos de respuesta al registrar', async () => {
            const mockData = { message: 'Usuario registrado' };
            mockedApi.post.mockResolvedValueOnce({ data: mockData });

            const result = await authService.register('Juan', 'juan@mail.com', 'pass123');

            expect(result).toEqual(mockData);
        });

        it('debería lanzar error con mensaje del servidor al fallar', async () => {
            mockedApi.post.mockRejectedValueOnce({
                response: { data: { error: 'El email ya está registrado' } },
            });

            await expect(authService.register('Juan', 'existe@mail.com', 'pass'))
                .rejects.toThrow('El email ya está registrado');
        });
    });

    // ── Confirmar cuenta ──────────────────────────────────────────
    describe('confirmAccount', () => {
        it('debería llamar a GET /auth/confirm/:token', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: { message: 'Confirmada' } });

            await authService.confirmAccount('abc123');

            expect(mockedApi.get).toHaveBeenCalledWith('/auth/confirm/abc123');
        });

        it('debería lanzar error si el token es inválido', async () => {
            mockedApi.get.mockRejectedValueOnce({
                response: { data: { error: 'Token inválido o expirado' } },
            });

            await expect(authService.confirmAccount('bad-token'))
                .rejects.toThrow('Token inválido o expirado');
        });
    });

    // ── Forgot password ───────────────────────────────────────────
    describe('forgotPassword', () => {
        it('debería enviar el email al endpoint correcto', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: { message: 'Email enviado' } });

            const result = await authService.forgotPassword('test@mail.com');

            expect(mockedApi.post).toHaveBeenCalledWith('/auth/forgot-password', {
                email: 'test@mail.com',
            });
            expect(result).toEqual({ message: 'Email enviado' });
        });
    });

    // ── Reset password ────────────────────────────────────────────
    describe('resetPassword', () => {
        it('debería enviar la nueva contraseña con el token al endpoint correcto', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: { message: 'Actualizada' } });

            const result = await authService.resetPassword('tok-123', 'nuevaPass');

            expect(mockedApi.post).toHaveBeenCalledWith('/auth/reset-password/tok-123', {
                password: 'nuevaPass',
            });
            expect(result).toEqual({ message: 'Actualizada' });
        });
    });

    // ── Accept invitation ─────────────────────────────────────────
    describe('acceptInvitation', () => {
        it('debería llamar a POST /shops/invitations/:token/accept', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: { message: 'Invitación aceptada' } });

            const result = await authService.acceptInvitation('invite-tok');

            expect(mockedApi.post).toHaveBeenCalledWith('/shops/invitations/invite-tok/accept');
            expect(result).toEqual({ message: 'Invitación aceptada' });
        });

        it('debería lanzar error si la invitación es inválida', async () => {
            mockedApi.post.mockRejectedValueOnce({
                response: { data: { error: 'Invitación expirada' } },
            });

            await expect(authService.acceptInvitation('expired'))
                .rejects.toThrow('Invitación expirada');
        });
    });
});
