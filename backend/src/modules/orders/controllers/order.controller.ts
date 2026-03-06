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

        const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=orden-${(order._id as any).toString().slice(-8)}.pdf`);
        doc.pipe(res);

        // Función para dibujar el header en cada página
        const drawHeader = () => {
            doc.save();
            doc.circle(70, 60, 30).fill('#059669');
            doc.restore();
            doc.fontSize(26).font('Helvetica-Bold').fillColor('#059669').text('StoreHub', 120, 45);
            doc.fontSize(12).font('Helvetica').fillColor('#666').text('Comprobante de Orden', 120, 75);
            doc.moveDown(2);
            doc.strokeColor('#059669').lineWidth(2).moveTo(40, 110).lineTo(555, 110).stroke();
            doc.y = 130;
        };

        drawHeader();

        let boxY = doc.y;
        doc.rect(40, boxY, 515, 55).fillAndStroke('#f0fdf4', '#059669');
        doc.fillColor('#059669').fontSize(12).font('Helvetica-Bold').text('Detalles de la Orden', 55, boxY + 10);
        doc.fontSize(10).font('Helvetica').fillColor('#475569');
        doc.text(`ID: #${(order._id as any).toString().slice(-8)}`, 55, boxY + 30);
        doc.text(`Fecha: ${new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeStyle: 'short' }).format(order.createdAt)}`, 200, boxY + 30);
        doc.text(`Estado: ${order.status}`, 430, boxY + 30);
        doc.y = boxY + 65;

        boxY = doc.y;
        doc.rect(40, boxY, 515, 55).fillAndStroke('#f1f5f9', '#059669');
        doc.fillColor('#059669').fontSize(12).font('Helvetica-Bold').text('Datos del Comprador', 55, boxY + 10);
        doc.fontSize(10).font('Helvetica').fillColor('#475569');
        doc.text(`Nombre: ${order.buyer?.name || '-'}`, 55, boxY + 30);
        doc.text(`Email: ${order.buyer?.email || '-'}`, 220, boxY + 30);
        doc.text(`Telefono: ${order.buyer?.phone || '-'}`, 430, boxY + 30);
        doc.y = boxY + 65;

        const hasNotes = !!order.buyer?.notes;
        const shippingBoxH = hasNotes ? 75 : 55;
        boxY = doc.y;
        doc.rect(40, boxY, 515, shippingBoxH).fillAndStroke('#f0fdf4', '#059669');
        doc.fillColor('#059669').fontSize(12).font('Helvetica-Bold').text('Direccion de Envio', 55, boxY + 10);
        doc.fontSize(9).font('Helvetica').fillColor('#475569');
        doc.text(`Direccion: ${order.buyer?.address || '-'} ${order.buyer?.streetNumber || ''}`, 55, boxY + 30);
        doc.text(`Ciudad: ${order.buyer?.city || '-'}`, 310, boxY + 30);
        doc.text(`Provincia: ${order.buyer?.province || '-'}`, 55, boxY + 45);
        doc.text(`CP: ${order.buyer?.postalCode || '-'}`, 200, boxY + 45);
        doc.text(`Metodo: ${order.shipping?.method || 'Estandar'}`, 360, boxY + 45);
        if (hasNotes) doc.text(`Notas: ${order.buyer!.notes}`, 55, boxY + 60);
        doc.y = boxY + shippingBoxH + 20;

        doc.fillColor('#059669').fontSize(14).font('Helvetica-Bold').text('Productos', 40);
        doc.moveDown(0.5);
        
        const colX = { name: 50, price: 300, qty: 380, subtotal: 460 };
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748b');
        doc.text('Producto', colX.name, doc.y, { continued: true }).text('Precio', colX.price, doc.y, { width: 80, align: 'right', continued: true }).text('Cant.', colX.qty, doc.y, { width: 50, align: 'right', continued: true }).text('Subtotal', colX.subtotal, doc.y, { width: 85, align: 'right' });
        
        doc.strokeColor('#059669').lineWidth(1).moveTo(40, doc.y + 2).lineTo(555, doc.y + 2).stroke();
        doc.moveDown(0.8);

        doc.font('Helvetica').fontSize(10).fillColor('#334155');
        
        for (const product of order.products) {
            if (doc.y > 700) { 
                doc.addPage();
                drawHeader();
                doc.y = 140;
            }

            const rowY = doc.y;
            doc.text(product.name || '-', colX.name, rowY, { width: 240 });
            doc.text(`$${product.price.toFixed(2)}`, colX.price, rowY, { width: 80, align: 'right' });
            doc.text(`${product.quantity}`, colX.qty, rowY, { width: 50, align: 'right' });
            doc.text(`$${(product.price * product.quantity).toFixed(2)}`, colX.subtotal, rowY, { width: 85, align: 'right' });
            doc.moveDown(0.5);
        }

        if (doc.y > 720) doc.addPage();
        doc.moveDown(1);
        doc.strokeColor('#e2e8f0').moveTo(350, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(0.5);

        const subtotalProducts = order.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        doc.fontSize(10).font('Helvetica').fillColor('#475569');
        doc.text(`Subtotal: $${subtotalProducts.toFixed(2)}`, 350, doc.y, { width: 200, align: 'right' });
        doc.moveDown(0.4);
        doc.text(`Envio: $${(order.shipping?.cost || 0).toFixed(2)}`, 350, doc.y, { width: 200, align: 'right' });
        doc.moveDown(0.6);
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#059669');
        doc.text(`Total: $${order.total.toFixed(2)}`, 350, doc.y, { width: 200, align: 'right' });

        doc.fontSize(9).font('Helvetica').fillColor('#94a3b8').text('Documento generado automáticamente por StoreHub', 40, 780, { align: 'center' });

        doc.end();
    } catch (error: any) {
        console.error('Error generando PDF:', error);
        res.status(500).json({ error: 'Error generando PDF' });
    }

  }
}