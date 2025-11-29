import { getTenantDB } from '../../database/tenantConnection';
import { getModelByTenant } from '../../database/modelFactory';
import { OrderSchema, IOrder } from '../models/order.schema';
import { ProductSchema, IProduct } from '../../products/models/product.schema';

export class OrderService {

  private getModel(shopSlug: string) {
    const dbName = `db_${shopSlug}`;
    const tenantConnection = getTenantDB(dbName);
    return getModelByTenant<IOrder>(tenantConnection, 'Order', OrderSchema);
  }

  private getProductModel(shopSlug: string) {
    const dbName = `db_${shopSlug}`;
    const tenantConnection = getTenantDB(dbName);
    return getModelByTenant<IProduct>(tenantConnection, 'Product', ProductSchema);
  }
  
  async createOrder(shopSlug: string, orderData: any) {
    const OrderModel = this.getModel(shopSlug);
    const ProductModel = this.getProductModel(shopSlug);

    const { buyer, products } = orderData;
    
    const orderProducts = [];
    let calculatedTotal = 0;

    /**
     * Iteramos los productos para validar Stock y Precios.
     * Si todo está bien, descontamos el stock y preparamos la orden.
     * Nota: Sin transacciones de Mongo (que requieren Replica Set), si esto falla a la mitad
     * podría quedar un stock descontado sin orden. Para este MVP es aceptable, 
     * pero idealmente se usarían Transactions.
     */

    for (const item of products) {
        const productDb = await ProductModel.findById(item.productId);

        if (!productDb) {
            throw new Error(`El producto con ID ${item.productId} no existe.`);
        }

        // validar Stock
        if (productDb.stock < item.quantity) {
            throw new Error(`Stock insuficiente para: ${productDb.name}. Disponible: ${productDb.stock}`);
        }

        //  snapshot de datos (congelamos el precio y nombre al momento de la compra)
        const snapshotItem = {
            productId: productDb._id,
            name: productDb.name,
            price: productDb.price, 
            quantity: item.quantity,
            description: productDb.description,
            imageUrl: productDb.imageUrl
        };

        orderProducts.push(snapshotItem);
        calculatedTotal += (productDb.price * item.quantity);

        await ProductModel.findByIdAndUpdate(item.productId, { 
            $inc: { stock: -item.quantity }  // baja el stock
        });
    }

    const newOrder = new OrderModel({
        buyer,
        products: orderProducts,
        total: calculatedTotal,
        status: 'Pendiente'
    });

    return await newOrder.save();
}

  async getOrders(shopSlug: string) {
    const OrderModel = this.getModel(shopSlug);
    return await OrderModel.find().sort({ createdAt: -1 });
  }

  async getOrderById(shopSlug: string, orderId: string) {
    const OrderModel = this.getModel(shopSlug);
    return await OrderModel.findById(orderId);
  }

  async updateOrderStatus(shopSlug: string, orderId: string, newStatus: string) {
    const OrderModel = this.getModel(shopSlug);
    const ProductModel = this.getProductModel(shopSlug);

    const order = await OrderModel.findById(orderId);
    if (!order) return null;

    if (newStatus === 'Cancelado' && order.status !== 'Cancelado') {
        for (const item of order.products) {
            await ProductModel.findByIdAndUpdate(item.productId, { 
                $inc: { stock: item.quantity } //  devolvemos el stock
            });
        }
    }

    // Solo actualizamos el status
    order.status = newStatus as any;
    return await order.save();
  }


}
