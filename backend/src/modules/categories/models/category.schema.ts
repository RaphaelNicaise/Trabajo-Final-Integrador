import { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string; // Para la URL (ej: /tienda/zapatillas)
  createdAt: Date;
  updatedAt: Date;
}

export const CategorySchema = new Schema<ICategory>({
  name: { 
    type: String, 
    required: [true, 'El nombre de la categoría es obligatorio'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    // unique: true // Nota: La unicidad la maneja Mongo por colección (Tenant), así que funcionará bien.
  },
}, { 
  timestamps: true 
});