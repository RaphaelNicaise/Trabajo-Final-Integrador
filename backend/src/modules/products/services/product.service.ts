import { getTenantDB } from '../../database/tenantconnection'; // Ajusta la ruta si es necesario
import { getModelByTenant } from '../../database/modelFactory';
import { ProductSchema, IProduct } from '../models/product.schema';

export class ProductService {

  /**
   * Crea un producto en la base de datos de una tienda específica.
   * @param shopId El identificador de la tienda (ej: 'shop_1') que será el nombre de la DB.
   * @param productData Los datos del producto.
   */
  async createProduct(shopId: string, productData: Partial<IProduct>) {
    // 1. Obtener la conexión a la base de datos de ESA tienda
    // El prefijo 'db_' es opcional, pero ayuda a organizar en Mongo.
    // Si tu lógica es que el shopId ya es el nombre de la db, quita el prefijo.
    const dbName = `db_${shopId}`; 
    const tenantConnection = getTenantDB(dbName);

    // 2. Obtener el modelo Producto vinculado a esa conexión
    const ProductModel = getModelByTenant<IProduct>(tenantConnection, 'Product', ProductSchema);

    // 3. Crear y guardar
    const newProduct = new ProductModel(productData);
    return await newProduct.save();
  }

  /**
   * Obtiene todos los productos de una tienda específica.
   */
  async getProducts(shopId: string) {
    const dbName = `db_${shopId}`;
    const tenantConnection = getTenantDB(dbName);
    const ProductModel = getModelByTenant<IProduct>(tenantConnection, 'Product', ProductSchema);

    return await ProductModel.find().sort({ createdAt: -1 });
  }
}