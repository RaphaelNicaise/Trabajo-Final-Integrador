import { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string; 
  
  // Confirmación de cuenta
  isConfirmed: boolean;
  confirmationToken?: string;

  // Recuperar contraseña
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  // Relación N:N - Tiendas a las que este usuario tiene acceso
  // Vital para el Dashboard "Mis Tiendas" al iniciar sesión
  associatedStores: Array<{
    tenantId: Types.ObjectId;
    slug: string;
    storeName: string;
    role: 'owner' | 'admin'; // to-do Por ahora no cambia nada, pero a futuro deberia afectar permisos
    // owner, solo el que crea, admin los que el owner agrega
  }>;

  validatePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: [true, 'El nombre es obligatorio'] 
  },
  email: { 
    type: String, 
    required: [true, 'El email es obligatorio'], 
    unique: true, 
    trim: true, 
    lowercase: true 
  },
  
  passwordHash: { 
    type: String, 
    required: true 
  },

  isConfirmed: {
    type: Boolean,
    default: false
  },
  confirmationToken: {
    type: String,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  
  // Lista de permisos sobre tiendas (a modificar)
  associatedStores: {
    type: [{
      tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
      slug: { type: String }, // Guardamos slug para generar links rápidos sin queries extra
      storeName: { type: String },
      role: { 
        type: String, 
        enum: ['owner', 'admin']
      }
    }],
    default: [] // Se inicia vacío explícitamente
  }
}, { 
  timestamps: true 
});

// Método de instancia para validar contraseñas
// Retorna false si el usuario no tiene contraseña (ej: usuario solo de Google)
UserSchema.methods.validatePassword = async function(password: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(password, this.passwordHash);
};

export { UserSchema };