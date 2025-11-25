import { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string; // Opcional para usuarios que entran con Google
  googleId?: string;     // ID único de Google (sub)
  avatar?: string;       // URL de la foto de perfil
  
  // Relación N:N - Tiendas a las que este usuario tiene acceso
  // Vital para el Dashboard "Mis Tiendas" al iniciar sesión
  associatedStores: Array<{
    tenantId: Types.ObjectId;
    slug: string;
    storeName: string;
    role: 'owner' | 'admin' | 'manager';
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
  
  // Contraseña opcional: solo requerida si el usuario se registra con email/pass tradicional
  passwordHash: { 
    type: String, 
    required: false 
  },
  
  // ID de Google: sparse: true permite que varios usuarios tengan este campo como null (los que usan password)
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  
  avatar: { 
    type: String,
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
        enum: ['owner', 'admin', 'manager'],
        default: 'manager'
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