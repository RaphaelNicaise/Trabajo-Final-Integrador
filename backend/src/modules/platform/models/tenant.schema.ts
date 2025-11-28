import { Schema, Document, Types } from 'mongoose';

export interface ITenant extends Document {
  slug: string;        
  dbName: string;      
  storeName: string;   
  ownerEmail: string;
  location?: string;    // <--- Movido aquí desde ShopConfig
  description?: string; // <--- Movido aquí desde ShopConfig
  
  members: Array<{
    userId: Types.ObjectId;
    role: 'owner' | 'admin';
  }>;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const TenantSchema = new Schema<ITenant>({
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    lowercase: true,
    immutable: true 
  },
  dbName: { type: String, required: true },
  storeName: { type: String, required: true },
  ownerEmail: { type: String, required: true, lowercase: true, trim: true },
  location: { type: String },     // Nuevo
  description: { type: String },  // Nuevo
  
  members: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'admin'], default: 'admin' }
  }],

  isActive: { type: Boolean, default: true }
}, { 
  timestamps: true 
});