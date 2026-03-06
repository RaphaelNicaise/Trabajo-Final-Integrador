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

        const pageW = doc.page.width;
        const pageH = doc.page.height;
        const margin = 40;
        const contentW = pageW - margin * 2;
        // Keep the footer comfortably above bottom margin to avoid implicit page breaks.
        const footerY = pageH - margin - 14;
        const bottomLimit = footerY - 30;

        const col = {
            name:     { x: margin + 10,  w: 230 },
            price:    { x: margin + 250, w: 80  },
            qty:      { x: margin + 340, w: 50  },
            subtotal: { x: margin + 400, w: 115 },
        };

        const drawPageChrome = () => {
            doc.save();
            doc.circle(70, 55, 28).fill('#059669');
            doc.restore();
            doc.fontSize(26).font('Helvetica-Bold').fillColor('#059669').text('StoreHub', 110, 40);
            doc.fontSize(12).font('Helvetica').fillColor('#666666').text('Comprobante de Orden', 110, 72);
            doc.strokeColor('#059669').lineWidth(2).moveTo(margin, 105).lineTo(pageW - margin, 105).stroke();
            doc.fontSize(9).font('Helvetica').fillColor('#94a3b8')
             .text('Documento generado automáticamente por StoreHub', margin, footerY, {
               width: contentW,
               align: 'center',
               lineBreak: false,
             });
        };

        const drawProductsHeader = (startY: number) => {
          doc.fillColor('#059669').fontSize(14).font('Helvetica-Bold').text('Productos', margin, startY);
          let localY = startY + 24;

          doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748b');
          doc.text('Producto', col.name.x, localY, { width: col.name.w });
          doc.text('Precio', col.price.x, localY, { width: col.price.w, align: 'right' });
          doc.text('Cant.', col.qty.x, localY, { width: col.qty.w, align: 'right' });
          doc.text('Subtotal', col.subtotal.x, localY, { width: col.subtotal.w, align: 'right' });
          localY += 18;
          doc.strokeColor('#059669').lineWidth(1).moveTo(margin, localY).lineTo(pageW - margin, localY).stroke();

          return localY + 8;
        };

        drawPageChrome();
        let y = 125;

        doc.rect(margin, y, contentW, 55).fillAndStroke('#f0fdf4', '#059669');
        doc.fillColor('#059669').fontSize(12).font('Helvetica-Bold').text('Detalles de la Orden', margin + 15, y + 10);
        doc.fontSize(10).font('Helvetica').fillColor('#475569');
        const orderId   = `#${(order._id as any).toString().slice(-8)}`;
        const orderDate = new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeStyle: 'short' }).format(order.createdAt);
        doc.text(`ID: ${orderId}`,          margin + 15,  y + 30);
        doc.text(`Fecha: ${orderDate}`,     margin + 150, y + 30);
        doc.text(`Estado: ${order.status}`, margin + 390, y + 30);
        y += 65;

        doc.rect(margin, y, contentW, 55).fillAndStroke('#f1f5f9', '#059669');
        doc.fillColor('#059669').fontSize(12).font('Helvetica-Bold').text('Datos del Comprador', margin + 15, y + 10);
        doc.fontSize(10).font('Helvetica').fillColor('#475569');
        doc.text(`Nombre: ${order.buyer?.name || '-'}`,    margin + 15,  y + 30);
        doc.text(`Email: ${order.buyer?.email || '-'}`,    margin + 180, y + 30);
        doc.text(`Teléfono: ${order.buyer?.phone || '-'}`, margin + 390, y + 30);
        y += 65;

        const hasNotes     = !!order.buyer?.notes;
        const shippingBoxH = hasNotes ? 80 : 62;
        doc.rect(margin, y, contentW, shippingBoxH).fillAndStroke('#f0fdf4', '#059669');
        doc.fillColor('#059669').fontSize(12).font('Helvetica-Bold').text('Dirección de Envío', margin + 15, y + 10);
        doc.fontSize(9).font('Helvetica').fillColor('#475569');
        doc.text(`Dirección: ${order.buyer?.address || '-'} ${order.buyer?.streetNumber || ''}`, margin + 15,  y + 30);
        doc.text(`Ciudad: ${order.buyer?.city || '-'}`,                                          margin + 310, y + 30);
        doc.text(`Provincia: ${order.buyer?.province || '-'}`,                                   margin + 15,  y + 45);
        doc.text(`CP: ${order.buyer?.postalCode || '-'}`,                                        margin + 200, y + 45);
        doc.text(`Método envío: ${order.shipping?.method || 'Estándar'}`,                        margin + 310, y + 45);
        if (hasNotes) doc.text(`Notas: ${order.buyer!.notes}`, margin + 15, y + 62);
        y += shippingBoxH + 20;

        y = drawProductsHeader(y);

        doc.font('Helvetica').fontSize(10).fillColor('#334155');
        for (const product of order.products) {
            const nameHeight = doc.heightOfString(product.name || '-', { width: col.name.w });
            const rowH = Math.max(nameHeight, 14) + 10;

            if (y + rowH > bottomLimit) {
                doc.addPage();
                drawPageChrome();
                y = 125;
              y = drawProductsHeader(y);
            }

            doc.text(product.name || '-',                                 col.name.x,     y, { width: col.name.w });
            doc.text(`$${product.price.toFixed(2)}`,                      col.price.x,    y, { width: col.price.w,    align: 'right' });
            doc.text(`${product.quantity}`,                               col.qty.x,      y, { width: col.qty.w,      align: 'right' });
            doc.text(`$${(product.price * product.quantity).toFixed(2)}`, col.subtotal.x, y, { width: col.subtotal.w, align: 'right' });
            y += rowH;
        }

        y += 10;
        if (y + 70 > bottomLimit) {
            doc.addPage();
            drawPageChrome();
            y = 125;
        }

        doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(margin + 310, y).lineTo(pageW - margin, y).stroke();
        y += 10;

        const subtotalProducts = order.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
        doc.fontSize(10).font('Helvetica').fillColor('#475569');
        doc.text(`Subtotal: $${subtotalProducts.toFixed(2)}`, margin, y, { width: contentW, align: 'right' });
        y += 18;
        doc.text(`Envío: $${(order.shipping?.cost || 0).toFixed(2)}`, margin, y, { width: contentW, align: 'right' });
        y += 24;
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#059669');
        doc.text(`Total: $${order.total.toFixed(2)}`, margin, y, { width: contentW, align: 'right' });

        doc.end();
    } catch (error: any) {
        console.error('Error generando PDF:', error);
        res.status(500).json({ error: 'Error generando PDF' });
    }
  }
}
