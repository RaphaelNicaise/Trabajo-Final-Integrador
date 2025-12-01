import { Schema, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  buyer: {
    name: string;
    email: string;
    address: string;
    postalCode: string
  };
  products: {
    productId: Types.ObjectId;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl?: string;
    quantity: number;
  }[];
  total: number;
  status: 'Pendiente' | 'Pagado' | 'Enviado' | 'Cancelado';
  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = new Schema<IOrder>({
  buyer: {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    address: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    }
  },
  products: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'El ID del producto es obligatorio']
    },
    name: { type: String },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo']
    },
    quantity: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [1, 'La cantidad debe ser al menos 1']
    }
  }],
  total: {
    type: Number,
    required: [true, 'El total es obligatorio'],
    min: [0, 'El total no puede ser negativo']
  },
  status: {
    type: String,
    enum: ['Pendiente', 'Pagado', 'Enviado', 'Cancelado'],
    default: 'Pendiente'
  }
}, {
  timestamps: true
});