import { getTenantDB } from '../../database/tenantConnection'; 
import { getModelByTenant } from '../../database/modelFactory';
import { CategorySchema, ICategory } from '../models/category.schema';
import { ProductSchema, IProduct } from '../../products/models/product.schema';

export class CategoryService {

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

  async createCategory(shopSlug: string, data: Partial<ICategory>) {
    const CategoryModel = this.getModel(shopSlug);
    // Generar slug simple si no viene (ej: "Ropa de Verano" -> "ropa-de-verano")
    if (data.name && !data.slug) {
        data.slug = data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    const newCategory = new CategoryModel(data);
    return await newCategory.save();
  }

  async getCategories(shopSlug: string) {
    const CategoryModel = this.getModel(shopSlug);
    return await CategoryModel.find().sort({ name: 1 });
  }

  async updateCategory(shopSlug: string, id: string, data: Partial<ICategory>) {
    const CategoryModel = this.getModel(shopSlug);
    return await CategoryModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteCategory(shopSlug: string, id: string) {
    const CategoryModel = this.getModel(shopSlug);
    const ProductModel = this.getProductModel(shopSlug);
    
    // Primero eliminar la categoría de todos los productos que la contengan
    await ProductModel.updateMany(
      { categories: id },
      { $pull: { categories: id } }
    );
    
    // Luego eliminar la categoría
    return await CategoryModel.findByIdAndDelete(id);
  }
}