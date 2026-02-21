import { getTenantDB } from '../../database/tenantConnection';
import { getModelByTenant } from '../../database/modelFactory';
import { ProductSchema, IProduct, IPromotion } from '../models/product.schema';
import { CacheService } from '../../cache/services/cache.service'; //

export class ProductService {
  private readonly RESOURCE = 'products';

  private getModel(shopSlug: string) {
    const dbName = `db_${shopSlug}`; //
    const tenantConnection = getTenantDB(dbName); //
    return getModelByTenant<IProduct>(tenantConnection, 'Product', ProductSchema); //
  }

  private getListKey(shopSlug: string): string {
    return `tenant:${shopSlug}:${this.RESOURCE}:list`;
  }

  private getItemKey(shopSlug: string, productId: string): string {
    return `tenant:${shopSlug}:${this.RESOURCE}:item:${productId}`;
  }

  private async invalidateCache(shopSlug: string, productId?: string) {
    await CacheService.delete(this.getListKey(shopSlug));
    if (productId) {
      await CacheService.delete(this.getItemKey(shopSlug, productId));
    }
  }

  async createProduct(shopSlug: string, productData: Partial<IProduct>) {
    const ProductModel = this.getModel(shopSlug);
    const newProduct = new ProductModel(productData);
    const savedProduct = await newProduct.save();

    await this.invalidateCache(shopSlug); // Invalidar lista
    return savedProduct;
  }

  async getProducts(shopSlug: string) {
    const cacheKey = this.getListKey(shopSlug);

    const cached = await CacheService.get<IProduct[]>(cacheKey);
    if (cached) return cached; //

    const ProductModel = this.getModel(shopSlug);
    const products = await ProductModel.find().sort({ createdAt: -1 }).lean(); //

    await CacheService.set(cacheKey, products, 3600); // cache por 1 hora
    return products;
  }

  async getProductById(shopSlug: string, productId: string) {
    const cacheKey = this.getItemKey(shopSlug, productId);

    const cached = await CacheService.get<IProduct>(cacheKey);
    if (cached) return cached; //

    const ProductModel = this.getModel(shopSlug);
    const product = await ProductModel.findById(productId).lean(); //

    if (product) {
      await CacheService.set(cacheKey, product, 3600);
    }
    return product;
  }
  
  async updateProduct(shopSlug: string, productId: string, updateData: Partial<IProduct>) {
    const ProductModel = this.getModel(shopSlug);
    const updated = await ProductModel.findByIdAndUpdate(productId, updateData, { 
      new: true, 
      runValidators: true 
    });

    if (updated) await this.invalidateCache(shopSlug, productId); //
    return updated;
  }

  async deleteProduct(shopSlug: string, productId: string) {
    const ProductModel = this.getModel(shopSlug);
    const deleted = await ProductModel.findByIdAndDelete(productId);

    if (deleted) await this.invalidateCache(shopSlug, productId); //
    return deleted;
  }

  // ── Promociones ───────────────────────────────────────────────────
  async setPromotion(shopSlug: string, productId: string, promotion: IPromotion) {
    const ProductModel = this.getModel(shopSlug);
    const updated = await ProductModel.findByIdAndUpdate(
      productId,
      { $set: { promotion } },
      { new: true, runValidators: true }
    );

    if (updated) await this.invalidateCache(shopSlug, productId); //
    return updated;
  }

  async removePromotion(shopSlug: string, productId: string) {
    const ProductModel = this.getModel(shopSlug);
    const updated = await ProductModel.findByIdAndUpdate(
      productId,
      { $set: { promotion: null } },
      { new: true }
    );

    if (updated) await this.invalidateCache(shopSlug, productId); //
    return updated;
  }

  async getProductsWithActivePromotions(shopSlug: string) {
    const ProductModel = this.getModel(shopSlug);
    return await ProductModel.find({ 'promotion.activa': true }).sort({ updatedAt: -1 }).lean();
  }
}