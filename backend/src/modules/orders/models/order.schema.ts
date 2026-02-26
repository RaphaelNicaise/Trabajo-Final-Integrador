import { Schema, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  buyer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    streetNumber: string;
    city: string;
    province: string;
    postalCode: string;
    notes?: string;
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
  shipping: {
    cost: number;
    estimatedDays: number;
    method: string;
  };
  payment: {
    method: string;
    cardLastFour: string;
    cardHolder: string;
    status: 'Aprobado' | 'Pendiente' | 'Rechazado';
  };
  total: number;
  status: 'Pendiente' | 'Confirmado' | 'Enviado' | 'Cancelado';
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
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    streetNumber: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    province: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    },
    notes: {
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
  shipping: {
    cost: { type: Number, default: 0 },
    estimatedDays: { type: Number, default: 0 },
    method: { type: String, default: 'Estándar' }
  },
  payment: {
    method: { type: String, default: 'Tarjeta' },
    cardLastFour: { type: String, default: '' },
    cardHolder: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Aprobado', 'Pendiente', 'Rechazado'],
      default: 'Aprobado'
    }
  },
  total: {
    type: Number,
    required: [true, 'El total es obligatorio'],
    min: [0, 'El total no puede ser negativo']
  },
  status: {
    type: String,
    enum: ['Pendiente', 'Confirmado', 'Enviado', 'Cancelado'],
    default: 'Confirmado'
  }
}, {
  timestamps: true
});