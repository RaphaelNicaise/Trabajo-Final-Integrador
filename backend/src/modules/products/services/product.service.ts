import { getTenantDB } from '../../database/tenantConnection';
import { getModelByTenant } from '../../database/modelFactory';
import { ProductSchema, IProduct, IPromotion } from '../models/product.schema';

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
    return await ProductModel.findByIdAndUpdate(productId, updateData, { 
      new: true, 
      runValidators: true 
    });
  }

  async deleteProduct(shopSlug: string, productId: string) {
    const ProductModel = this.getModel(shopSlug);
    return await ProductModel.findByIdAndDelete(productId);
  }

  // ── Promociones ───────────────────────────────────────────────────
  async setPromotion(shopSlug: string, productId: string, promotion: IPromotion) {
    const ProductModel = this.getModel(shopSlug);
    return await ProductModel.findByIdAndUpdate(
      productId,
      { $set: { promotion } },
      { new: true, runValidators: true }
    );
  }

  async removePromotion(shopSlug: string, productId: string) {
    const ProductModel = this.getModel(shopSlug);
    return await ProductModel.findByIdAndUpdate(
      productId,
      { $set: { promotion: null } },
      { new: true }
    );
  }

  async getProductsWithActivePromotions(shopSlug: string) {
    const ProductModel = this.getModel(shopSlug);
    return await ProductModel.find({ 'promotion.activa': true }).sort({ updatedAt: -1 });
  }
}