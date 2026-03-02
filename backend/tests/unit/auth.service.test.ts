import { AuthService } from '../../src/modules/auth/services/auth.service';
import { MailService } from '../../src/modules/mail/services/mail.service';
import { getMetaDB } from '../../src/modules/database/tenantConnection';
import { getModelByTenant } from '../../src/modules/database/modelFactory';
import bcrypt from 'bcryptjs';

// Mocks
jest.mock('../../src/modules/database/tenantConnection');
jest.mock('../../src/modules/database/modelFactory');
jest.mock('../../src/modules/mail/services/mail.service');
jest.mock('bcryptjs');

describe('AuthService', () => {
    let authService: AuthService;
    const mockUserData = {
        name: 'Usuario Prueba',
        email: 'test@test.com',
        passwordHash: 'hashed_password',
        isConfirmed: true,
        validatePassword: jest.fn()
    };

    const mockSave = jest.fn();
    const mockFindOne = jest.fn();

    function MockUserModel(this: any, data: any) {
        Object.assign(this, data);
        this.save = mockSave;
    }
    MockUserModel.findOne = mockFindOne;

    beforeEach(() => {
        jest.clearAllMocks();
        authService = new AuthService();

        (getMetaDB as jest.Mock).mockReturnValue({});
        (getModelByTenant as jest.Mock).mockReturnValue(MockUserModel);
    });

    describe('register', () => {
        it('debería registrar un nuevo usuario y enviar email de confirmación', async () => {
            mockFindOne.mockResolvedValue(null);
            (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
            mockSave.mockResolvedValue({ _id: 'user1', ...mockUserData });

            const result = await authService.register({
                name: 'Usuario Prueba',
                email: 'test@test.com',
                password: 'password123'
            });

            expect(mockSave).toHaveBeenCalled();
            expect(MailService.sendEmail).toHaveBeenCalled();
            expect(result.email).toBe('test@test.com');
        });

        it('debería lanzar un error si el email ya está registrado', async () => {
            mockFindOne.mockResolvedValue(mockUserData);

            await expect(authService.register({
                name: 'Otro',
                email: 'test@test.com',
                password: 'password'
            })).rejects.toThrow('El correo electrónico ya está registrado.');
        });
    });

    describe('login', () => {
        it('debería autenticar correctamente con credenciales válidas', async () => {
            mockFindOne.mockResolvedValue(mockUserData);
            mockUserData.validatePassword.mockResolvedValue(true);

            const result = await authService.login({
                email: 'test@test.com',
                password: 'password123'
            });

            expect(result.email).toBe('test@test.com');
            expect(mockUserData.validatePassword).toHaveBeenCalledWith('password123');
        });

        it('debería lanzar error si la cuenta no está confirmada', async () => {
            mockFindOne.mockResolvedValue({ ...mockUserData, isConfirmed: false });

            await expect(authService.login({
                email: 'test@test.com',
                password: 'password'
            })).rejects.toThrow('Debés confirmar tu cuenta');
        });

        it('debería lanzar error si la contraseña es incorrecta', async () => {
            mockFindOne.mockResolvedValue(mockUserData);
            mockUserData.validatePassword.mockResolvedValue(false);

            await expect(authService.login({
                email: 'test@test.com',
                password: 'wrong'
            })).rejects.toThrow('Credenciales inválidas.');
        });
    });

    describe('confirmAccount', () => {
        it('debería confirmar la cuenta si el token es válido', async () => {
            const unconfirmedUser = { ...mockUserData, isConfirmed: false, save: mockSave };
            mockFindOne.mockResolvedValue(unconfirmedUser);

            const result = await authService.confirmAccount('valid_token');

            expect(unconfirmedUser.isConfirmed).toBe(true);
            expect(mockSave).toHaveBeenCalled();
            expect(result.isConfirmed).toBe(true);
        });
    });
});
