import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getMetaDB } from '@/modules/database/tenantConnection';
import { getModelByTenant } from '@/modules/database/modelFactory';
import { UserSchema, IUser } from '@/modules/platform/models/user.schema';
import { MailService } from '@/modules/mail/services/mail.service';
import { passwordResetTemplate } from '@/modules/mail/templates/passwordReset.template';
import { accountConfirmationTemplate } from '@/modules/mail/templates/accountConfirmation.template';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export class AuthService {

  private getUserModel() {
    const metaConnection = getMetaDB();
    return getModelByTenant<IUser>(metaConnection, 'User', UserSchema);
  }

  async register(userData: { name: string; email: string; password?: string }) {
    const UserModel = this.getUserModel();

    if (!userData.password) {
        throw new Error('La contraseña es obligatoria para el registro.');
    }

    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const confirmationToken = crypto.randomBytes(32).toString('hex');

    const newUser = new UserModel({
      name: userData.name,
      email: userData.email,
      passwordHash: passwordHash,
      isConfirmed: false,
      confirmationToken,
      associatedStores: []
    });

    await newUser.save();

    // Enviar email de confirmación
    const confirmLink = `${FRONTEND_URL}/confirmar-cuenta/${confirmationToken}`;
    const template = accountConfirmationTemplate({
      userName: userData.name,
      confirmLink,
    });

    try {
      await MailService.sendEmail(userData.email, template);
    } catch (error) {
      console.error('Error al enviar email de confirmación:', error);
    }

    return newUser;
  }

  async login(credentials: { email: string; password?: string }) {
    const UserModel = this.getUserModel();

    if (!credentials.password) {
        throw new Error('La contraseña es obligatoria.');
    }

    const user = await UserModel.findOne({ email: credentials.email });
    if (!user) {
      throw new Error('Credenciales inválidas.');
    }

    if (!user.isConfirmed) {
      throw new Error('Debés confirmar tu cuenta. Revisá tu correo electrónico.');
    }

    const isValid = await user.validatePassword(credentials.password);
    
    if (!isValid) {
        throw new Error('Credenciales inválidas.');
    }
    return user;
  }

  async confirmAccount(token: string) {
    const UserModel = this.getUserModel();

    const user = await UserModel.findOne({ confirmationToken: token });
    if (!user) {
      throw new Error('Token de confirmación inválido o expirado.');
    }

    if (user.isConfirmed) {
      throw new Error('La cuenta ya fue confirmada.');
    }

    user.isConfirmed = true;
    user.confirmationToken = undefined;
    await user.save();

    return user;
  }

  async forgotPassword(email: string) {
    const UserModel = this.getUserModel();

    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // No revelar si el email existe o no (seguridad)
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
    await user.save();

    const resetLink = `${FRONTEND_URL}/restablecer-contrasena/${resetToken}`;
    const template = passwordResetTemplate({
      userName: user.name,
      resetLink,
    });

    await MailService.sendEmail(user.email, template);
  }

  async resetPassword(token: string, newPassword: string) {
    const UserModel = this.getUserModel();

    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Token inválido o expirado. Solicitá un nuevo enlace.');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return user;
  }

  async getAllUsers() {
      const UserModel = this.getUserModel();
      return await UserModel.find().select('-passwordHash');
  }
}