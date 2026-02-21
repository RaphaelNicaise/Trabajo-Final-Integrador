import { getTenantDB } from '../../database/tenantConnection'; 
import { getModelByTenant } from '../../database/modelFactory';
import { CategorySchema, ICategory } from '../models/category.schema';
import { ProductSchema, IProduct } from '../../products/models/product.schema';
import { CacheService } from '../../cache/services/cache.service'; // Importamos tu nuevo servicio

export class CategoryService {
  private readonly RESOURCE = 'categories';

  private getModel(shopSlug: string) {
    const dbName = `db_${shopSlug}`;
    const tenantConnection = getTenantDB(dbName);
    return getModelByTenant<ICategory>(tenantConnection, 'Category', CategorySchema);
  }

  private getProductModel(shopSlug: string) {
    const dbName = `db_${shopSlug}`;
    const tenantConnection = getTenantDB(dbName);
    return getModelByTenant<IProduct>(tenantConnection, 'Product', ProductSchema);
  }

  private getCacheKey(shopSlug: string): string {
    return `tenant:${shopSlug}:${this.RESOURCE}`;
  }

  async createCategory(shopSlug: string, data: Partial<ICategory>) {
    const CategoryModel = this.getModel(shopSlug);
    
    if (data.name && !data.slug) {
        data.slug = data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    
    const newCategory = new CategoryModel(data);
    const savedCategory = await newCategory.save();

    // INVALIDACIÓN: Al crear una categoría, borramos la lista cacheada
    await CacheService.delete(this.getCacheKey(shopSlug));

    return savedCategory;
  }

  async getCategories(shopSlug: string) {
    const cacheKey = this.getCacheKey(shopSlug);

    const cached = await CacheService.get<ICategory[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const CategoryModel = this.getModel(shopSlug);
    const categories = await CategoryModel.find().sort({ name: 1 }).lean();

    await CacheService.set(cacheKey, categories, 3600);

    return categories;
  }

  async updateCategory(shopSlug: string, id: string, data: Partial<ICategory>) {
    const CategoryModel = this.getModel(shopSlug);
    const updatedCategory = await CategoryModel.findByIdAndUpdate(id, data, { new: true });

    // INVALIDACIÓN: Borramos la caché para que el frontend vea los cambios
    if (updatedCategory) {
      await CacheService.delete(this.getCacheKey(shopSlug));
    }

    return updatedCategory;
  }

  async deleteCategory(shopSlug: string, id: string) {
    const CategoryModel = this.getModel(shopSlug);
    const ProductModel = this.getProductModel(shopSlug);
    
    await ProductModel.updateMany(
      { categories: id },
      { $pull: { categories: id } }
    );
    
    const deletedCategory = await CategoryModel.findByIdAndDelete(id);

    // INVALIDACIÓN: Borramos la caché tras eliminar
    await CacheService.delete(this.getCacheKey(shopSlug));

    return deletedCategory;
  }
}