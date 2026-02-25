import { transporter } from '@/config/mail';
import { getMetaDB } from '@/modules/database/tenantConnection';
import { getModelByTenant } from '@/modules/database/modelFactory';
import { TenantSchema, ITenant } from '@/modules/platform/models/tenant.schema';
import { IOrder } from '@/modules/orders/models/order.schema';
import { newOrderTemplate } from '@/modules/mail/templates/newOrder.template';

export class MailService {
  /**
   * Envía un correo electrónico utilizando un template predefinido
   */
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

  /**
   * Notifica al dueño de la tienda que se recibió una nueva orden
   */
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
}