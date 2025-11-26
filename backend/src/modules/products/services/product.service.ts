import { getTenantDB } from '../../database/tenantConnection'; // Ajusta la ruta si es necesario
import { getModelByTenant } from '../../database/modelFactory';
import { ProductSchema, IProduct } from '../models/product.schema';

export class ProductService {

  private getModel(shopSlug: string) {
    const dbName = `db_${shopSlug}`;
    const tenantConnection = getTenantDB(dbName);
    return getModelByTenant<IProduct>(tenantConnection, 'Product', ProductSchema);
  }
  
  async createProduct(shopSlug: string, productData: Partial<IProduct>) {
    const ProductModel = this.getModel(shopSlug);
    const newProduct = new ProductModel(productData);
    return await newProduct.save();
  }

  async getProducts(shopSlug: string) {
    const ProductModel = this.getModel(shopSlug);
    return await ProductModel.find().sort({ createdAt: -1 });
  }

  async getProductById(shopSlug: string, productId: string) {
    const ProductModel = this.getModel(shopSlug);
    return await ProductModel.findById(productId);
  }
  
  async updateProduct(shopSlug: string, productId: string, updateData: Partial<IProduct>) {
    const ProductModel = this.getModel(shopSlug);
    
    // { new: true } devuelve el documento YA actualizado
    // { runValidators: true } asegura que no guarden precios negativos o datos raros al editar
    return await ProductModel.findByIdAndUpdate(productId, updateData, { 
      new: true, 
      runValidators: true 
    });
  }

  async deleteProduct(shopSlug: string, productId: string) {
    const ProductModel = this.getModel(shopSlug);
    return await ProductModel.findByIdAndDelete(productId);
  }


}