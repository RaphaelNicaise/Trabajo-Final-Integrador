import bcrypt from 'bcryptjs';
import { getMetaDB } from '../../database/tenantConnection';
import { getModelByTenant } from '../../database/modelFactory';
import { UserSchema, IUser } from '../../platform/models/user.schema';

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

    const newUser = new UserModel({
      name: userData.name,
      email: userData.email,
      passwordHash: passwordHash,
      associatedStores: []
    });

    return await newUser.save();
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
    const isValid = await user.validatePassword(credentials.password);
    
    if (!isValid) {
        throw new Error('Credenciales inválidas.');
    }
    return user;
  }
  async getAllUsers() {
      const UserModel = this.getUserModel();
      return await UserModel.find().select('-passwordHash');
  }
}