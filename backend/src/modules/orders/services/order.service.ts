import { getTenantDB } from '../../database/tenantConnection';
import { getModelByTenant } from '../../database/modelFactory';
import { OrderSchema, IOrder } from '../models/order.schema';

export class OrderService {

  private getModel(shopSlug: string) {
    const dbName = `db_${shopSlug}`;
    const tenantConnection = getTenantDB(dbName);
    return getModelByTenant<IOrder>(tenantConnection, 'Order', OrderSchema);
  }

  async createOrder(shopSlug: string, orderData: Partial<IOrder>) {
    const OrderModel = this.getModel(shopSlug);
    const newOrder = new OrderModel(orderData);
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

  async updateOrder(shopSlug: string, orderId: string, updateData: Partial<IOrder>) {
    const OrderModel = this.getModel(shopSlug);

    return await OrderModel.findByIdAndUpdate(orderId, updateData, {
      new: true,
      runValidators: true
    });
  }

  async deleteOrder(shopSlug: string, orderId: string) {
    const OrderModel = this.getModel(shopSlug);
    return await OrderModel.findByIdAndDelete(orderId);
  }

}
