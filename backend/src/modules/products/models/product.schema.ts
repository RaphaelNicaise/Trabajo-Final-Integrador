import { Schema, Document } from 'mongoose';

export interface IPromotion {
  tipo: 'porcentaje' | 'fijo' | 'nxm';
  valor: number;
  valor_secundario?: number | null;
  activa: boolean;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categories?: Schema.Types.ObjectId[];
  promotion?: IPromotion;
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema = new Schema<IPromotion>({
  tipo: {
    type: String,
    enum: ['porcentaje', 'fijo', 'nxm'],
    required: true
  },
  valor: {
    type: Number,
    required: true,
    min: [0, 'El valor no puede ser negativo']
  },
  valor_secundario: {
    type: Number,
    default: null
  },
  activa: {
    type: Boolean,
    default: true
  }
}, { _id: false });

export const ProductSchema = new Schema<IProduct>({
  name: { 
    type: String, 
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
    unique: true
  },
  description: { 
    type: String,
    default: ''
  },
  price: { 
    type: Number, 
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  stock: { 
    type: Number, 
    default: 0,
    min: [0, 'El stock no puede ser negativo']
  },
  imageUrl: { 
    type: String,
    default: null
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  promotion: {
    type: PromotionSchema,
    default: null
  }
}, { 
  timestamps: true
});