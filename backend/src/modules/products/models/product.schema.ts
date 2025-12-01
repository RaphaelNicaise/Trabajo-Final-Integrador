import { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categories?: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
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
  }]
}, { 
  timestamps: true // Esto crea automáticamente createdAt y updatedAt
});