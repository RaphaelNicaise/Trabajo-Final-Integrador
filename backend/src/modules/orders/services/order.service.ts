import { getTenantDB } from '@/modules/database/tenantConnection';
import { getModelByTenant } from '@/modules/database/modelFactory';
import { OrderSchema, IOrder } from '@/modules/orders/models/order.schema';
import { ProductSchema, IProduct } from '@/modules/products/models/product.schema';
import { MailService } from '@/modules/mail/services/mail.service';

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

  /** Cotización simulada de envío */
  simulateShippingQuote(postalCode: string, province: string) {
    const baseCost = 1500;
    const provinceFactor: Record<string, number> = {
      'buenos aires': 1.0,
      'ciudad autónoma de buenos aires': 0.8,
      'córdoba': 1.3,
      'santa fe': 1.2,
      'mendoza': 1.5,
      'tucumán': 1.6,
      'entre ríos': 1.3,
      'salta': 1.7,
      'misiones': 1.8,
      'chaco': 1.7,
      'corrientes': 1.6,
      'santiago del estero': 1.5,
      'san juan': 1.6,
      'jujuy': 1.8,
      'río negro': 1.9,
      'neuquén': 1.9,
      'formosa': 1.8,
      'chubut': 2.0,
      'san luis': 1.5,
      'catamarca': 1.6,
      'la rioja': 1.6,
      'la pampa': 1.4,
      'santa cruz': 2.2,
      'tierra del fuego': 2.5,
    };

    const factor = provinceFactor[province.toLowerCase()] || 1.5;
    const cost = Math.round(baseCost * factor);
    const estimatedDays = factor <= 1.0 ? 2 : factor <= 1.5 ? 4 : factor <= 2.0 ? 6 : 8;

    return {
      cost,
      estimatedDays,
      method: 'Envío Estándar',
    };
  }
  
  async createOrder(shopSlug: string, orderData: any) {
    const OrderModel = this.getModel(shopSlug);
    const ProductModel = this.getProductModel(shopSlug);

    const { buyer, products, shipping, payment } = orderData;
    
    const orderProducts = [];
    let calculatedTotal = 0;

    for (const item of products) {
        const productDb = await ProductModel.findById(item.productId);

        if (!productDb) {
            throw new Error(`El producto con ID ${item.productId} no existe.`);
        }

        if (productDb.stock < item.quantity) {
            throw new Error(`Stock insuficiente para: ${productDb.name}. Disponible: ${productDb.stock}`);
        }

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
            $inc: { stock: -item.quantity }
        });
    }

    // Agregar costo de envío al total
    const shippingCost = shipping?.cost || 0;
    calculatedTotal += shippingCost;

    const newOrder = new OrderModel({
        buyer,
        products: orderProducts,
        shipping: shipping || { cost: 0, estimatedDays: 0, method: 'Estándar' },
        payment: payment || { method: 'Tarjeta', cardLastFour: '0000', cardHolder: '', status: 'Aprobado' },
        total: calculatedTotal,
        status: 'Confirmado'
    });

    const savedOrder = await newOrder.save();

    // Mail al vendedor (tienda)
    MailService.notifyNewOrder(shopSlug, savedOrder).catch((err) =>
      console.error('Error enviando notificación de nueva orden al vendedor:', err)
    );

    // Mail de confirmación al comprador
    if (buyer?.email) {
      MailService.sendOrderConfirmationToBuyer(shopSlug, savedOrder).catch((err) =>
        console.error('Error enviando confirmación de orden al comprador:', err)
      );
    }

    return savedOrder;
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
                $inc: { stock: item.quantity }
            });
        }
    }

    order.status = newStatus as any;
    return await order.save();
  }
}
