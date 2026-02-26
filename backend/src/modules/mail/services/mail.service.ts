import { transporter } from '@/config/mail';
import { getMetaDB } from '@/modules/database/tenantConnection';
import { getModelByTenant } from '@/modules/database/modelFactory';
import { TenantSchema, ITenant } from '@/modules/platform/models/tenant.schema';
import { IOrder } from '@/modules/orders/models/order.schema';
import { newOrderTemplate } from '@/modules/mail/templates/newOrder.template';
import { orderConfirmationTemplate } from '@/modules/mail/templates/orderConfirmation.template';

export class MailService {
  static async sendEmail(to: string, template: { subject: string; html: string }) {
    try {
      const info = await transporter.sendMail({
        from: `"StoreHub" <${process.env.MAIL_USER}>`,
        to,
        subject: template.subject,
        html: template.html,
      });

      console.log(`Mail enviado a ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Error en MailService:', error);
      throw new Error('No se pudo enviar el correo');
    }
  }

  static async notifyNewOrder(shopSlug: string, order: IOrder) {
    const metaConnection = getMetaDB();
    const TenantModel = getModelByTenant<ITenant>(metaConnection, 'Tenant', TenantSchema);
    const tenant = await TenantModel.findOne({ slug: shopSlug }).lean();

    if (!tenant?.ownerEmail) return;

    const template = newOrderTemplate({
      orderId: (order._id as any).toString(),
      storeName: tenant.storeName,
      buyerName: order.buyer?.name ?? 'Sin nombre',
      buyerEmail: order.buyer?.email ?? 'Sin email',
      total: order.total,
      itemCount: order.products.length,
      createdAt: new Date(),
    });

    await MailService.sendEmail(tenant.ownerEmail, template);
  }

  static async sendOrderConfirmationToBuyer(shopSlug: string, order: IOrder) {
    if (!order.buyer?.email) return;

    const metaConnection = getMetaDB();
    const TenantModel = getModelByTenant<ITenant>(metaConnection, 'Tenant', TenantSchema);
    const tenant = await TenantModel.findOne({ slug: shopSlug }).lean();

    const storeName = tenant?.storeName || shopSlug;
    const subtotal = order.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

    const template = orderConfirmationTemplate({
      orderId: (order._id as any).toString(),
      storeName,
      buyerName: order.buyer.name ?? 'Cliente',
      products: order.products.map((p) => ({
        name: p.name,
        price: p.price,
        quantity: p.quantity,
      })),
      subtotal,
      shippingCost: order.shipping?.cost || 0,
      total: order.total,
      address: order.buyer.address || '',
      streetNumber: order.buyer.streetNumber || '',
      city: order.buyer.city || '',
      province: order.buyer.province || '',
      postalCode: order.buyer.postalCode || '',
      estimatedDays: order.shipping?.estimatedDays || 0,
      createdAt: order.createdAt || new Date(),
    });

    await MailService.sendEmail(order.buyer.email, template);
  }
}