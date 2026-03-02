import { Request, Response } from 'express';
import { OrderService } from '@/modules/orders/services/order.service';
import PDFDocument from 'pdfkit';

const orderService = new OrderService();

export class OrderController {

  async create(req: Request, res: Response) {
    try {
      const shopSlug = req.headers['x-tenant-id'] as string;

      if (!shopSlug) { 
        return res.status(400).json({ error: 'Falta el header x-tenant-id para identificar la tienda.' }); 
      }

      const { buyer, products, shipping, payment } = req.body || {};

      if (!buyer) { return res.status(400).json({ error: 'El campo "buyer" es obligatorio.' }); }
      
      if (!products || !Array.isArray(products) || products.length === 0) { return res.status(400).json({ error: 'El campo "products" es obligatorio y debe ser un array no vacío.' }); }

      for (const p of products) {
        if (!p.productId || !p.quantity || p.quantity < 1) {
          return res.status(400).json({ error: 'Cada producto debe tener productId y quantity mayor a 0.' });
        }
      }

      const order = await orderService.createOrder(shopSlug, { buyer, products, shipping, payment });

      res.status(201).json({
        message: 'Orden creada exitosamente',
        data: order
      });

    } catch (error: any) {
      console.error('Error creando orden:', error.message);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Datos inválidos',
          details: error.message
        });
      }

      if (error.message.includes('no existe') || error.message.includes('Stock insuficiente')) {
          return res.status(409).json({ error: error.message });
      }

      res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const shopId = req.headers['x-tenant-id'] as string;
      if (!shopId) return res.status(400).json({ error: 'Falta el header x-tenant-id.' });

      const orders = await orderService.getOrders(shopId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const shopSlug = req.headers['x-tenant-id'] as string;
      const { id } = req.params;
      if (!shopSlug) return res.status(400).json({ error: 'Falta header x-tenant-id' });
      if (!id) return res.status(400).json({ error: 'Falta el ID de la orden' });

      const order = await orderService.getOrderById(shopSlug, id);
      if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
      
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const shopSlug = req.headers['x-tenant-id'] as string;
      const { id } = req.params;
      const { status } = req.body;

      if (!shopSlug) return res.status(400).json({ error: 'Falta header x-tenant-id' });
      if (!status) return res.status(400).json({ error: 'El campo status es obligatorio' });
      
      const validStatuses = ['Pendiente', 'Confirmado', 'Enviado', 'Cancelado'];
      if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: `Estado inválido. Permitidos: ${validStatuses.join(', ')}` });
      }

      const updatedOrder = await orderService.updateOrderStatus(shopSlug, id, status);
      if (!updatedOrder) return res.status(404).json({ error: 'Orden no encontrada' });

      res.json({ message: 'Estado de orden actualizado', data: updatedOrder });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async shippingQuote(req: Request, res: Response) {
    try {
      const { postalCode, province } = req.body;

      if (!postalCode || !province) {
        return res.status(400).json({ error: 'Se requiere código postal y provincia.' });
      }

      const quote = orderService.simulateShippingQuote(postalCode, province);
      res.json(quote);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async downloadPDF(req: Request, res: Response) {
    try {
      const shopSlug = req.headers['x-tenant-id'] as string;
      const { id } = req.params;

      if (!shopSlug) return res.status(400).json({ error: 'Falta header x-tenant-id' });

      const order = await orderService.getOrderById(shopSlug, id);
      if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

      const doc = new PDFDocument({ margin: 40, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=orden-${(order._id as any).toString().slice(-8)}.pdf`);
      doc.pipe(res);

      // --- LOGO Y HEADER ---
      // Si tienes un logo, puedes usar doc.image('ruta/logo.png', x, y, {width: 60})
      // Aquí solo agrego un círculo como placeholder
      doc.save();
      doc.circle(70, 60, 30).fill('#059669');
      doc.restore();
      doc.fontSize(26).font('Helvetica-Bold').fillColor('#059669').text('StoreHub', 120, 45, { align: 'left' });
      doc.fontSize(12).font('Helvetica').fillColor('#666').text('Comprobante de Orden', 120, 75, { align: 'left' });
      doc.moveDown(2);

      // --- SEPARADOR ---
      doc.strokeColor('#059669').lineWidth(2).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(1);

      // --- DATOS DE LA ORDEN ---
      doc.rect(40, doc.y, 515, 70).fillAndStroke('#f0fdf4', '#059669');
      doc.fillColor('#059669').fontSize(14).font('Helvetica-Bold').text('Detalles de la Orden', 55, doc.y + 10);
      doc.fontSize(10).font('Helvetica').fillColor('#475569');
      doc.text(`ID: #${(order._id as any).toString().slice(-8)}`, 55, doc.y + 25);
      doc.text(`Fecha: ${new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeStyle: 'short' }).format(order.createdAt)}`, 200, doc.y + 25);
      doc.text(`Estado: ${order.status}`, 400, doc.y + 25);
      doc.moveDown(3);

      // --- DATOS DEL COMPRADOR ---
      doc.rect(40, doc.y, 515, 60).fillAndStroke('#f1f5f9', '#059669');
      doc.fillColor('#059669').fontSize(14).font('Helvetica-Bold').text('Datos del Comprador', 55, doc.y + 10);
      doc.fontSize(10).font('Helvetica').fillColor('#475569');
      doc.text(`👤 Nombre: ${order.buyer?.name || '-'}`, 55, doc.y + 25);
      doc.text(`✉️ Email: ${order.buyer?.email || '-'}`, 250, doc.y + 25);
      doc.text(`📞 Teléfono: ${order.buyer?.phone || '-'}`, 400, doc.y + 25);
      doc.moveDown(2);

      // --- DATOS DE ENVÍO ---
      doc.rect(40, doc.y, 515, 70).fillAndStroke('#f0fdf4', '#059669');
      doc.fillColor('#059669').fontSize(14).font('Helvetica-Bold').text('Dirección de Envío', 55, doc.y + 10);
      doc.fontSize(10).font('Helvetica').fillColor('#475569');
      doc.text(`🏠 Dirección: ${order.buyer?.address || '-'} ${order.buyer?.streetNumber || ''}`, 55, doc.y + 25);
      doc.text(`🌆 Ciudad: ${order.buyer?.city || '-'}`, 250, doc.y + 25);
      doc.text(`🏢 Provincia: ${order.buyer?.province || '-'}`, 400, doc.y + 25);
      doc.text(`📮 Código Postal: ${order.buyer?.postalCode || '-'}`, 55, doc.y + 40);
      if (order.buyer?.notes) doc.text(`📝 Notas: ${order.buyer.notes}`, 250, doc.y + 40);
      doc.text(`🚚 Método: ${order.shipping?.method || 'Estándar'}`, 400, doc.y + 40);
      doc.moveDown(3);

      // --- TABLA DE PRODUCTOS ---
      doc.fillColor('#059669').fontSize(14).font('Helvetica-Bold').text('Productos', 40, doc.y);
      doc.moveDown(0.5);
      const tableTop = doc.y;
      const colX = { name: 50, price: 300, qty: 400, subtotal: 470 };
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748b');
      doc.text('Producto', colX.name, tableTop);
      doc.text('Precio', colX.price, tableTop, { width: 80, align: 'right' });
      doc.text('Cant.', colX.qty, tableTop, { width: 50, align: 'right' });
      doc.text('Subtotal', colX.subtotal, tableTop, { width: 75, align: 'right' });
      doc.moveDown(0.3);
      doc.strokeColor('#059669').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);

      doc.font('Helvetica').fontSize(10).fillColor('#334155');
      for (const product of order.products) {
        const rowY = doc.y;
        doc.text(product.name || '-', colX.name, rowY, { width: 240 });
        doc.text(`$${product.price.toFixed(2)}`, colX.price, rowY, { width: 80, align: 'right' });
        doc.text(`${product.quantity}`, colX.qty, rowY, { width: 50, align: 'right' });
        doc.text(`$${(product.price * product.quantity).toFixed(2)}`, colX.subtotal, rowY, { width: 75, align: 'right' });
        doc.moveDown(0.5);
      }

      doc.moveDown(0.3);
      doc.strokeColor('#059669').lineWidth(1).moveTo(350, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);

      const subtotalProducts = order.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      doc.fontSize(11).font('Helvetica').fillColor('#475569');
      doc.text(`Subtotal: $${subtotalProducts.toFixed(2)}`, 350, doc.y, { width: 195, align: 'right' });
      doc.moveDown(0.3);
      doc.text(`Envío: $${(order.shipping?.cost || 0).toFixed(2)}`, 350, doc.y, { width: 195, align: 'right' });
      doc.moveDown(0.3);
      doc.fontSize(15).font('Helvetica-Bold').fillColor('#059669');
      doc.text(`Total: $${order.total.toFixed(2)}`, 350, doc.y, { width: 195, align: 'right' });

      doc.moveDown(2);
      doc.fontSize(9).font('Helvetica').fillColor('#94a3b8').text('Documento generado automáticamente por StoreHub', { align: 'center' });

      doc.end();
    } catch (error: any) {
      console.error('Error generando PDF:', error);
      res.status(500).json({ error: error.message || 'Error generando PDF' });
    }
  }
}