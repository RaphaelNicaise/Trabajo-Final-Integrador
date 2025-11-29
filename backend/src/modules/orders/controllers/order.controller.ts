import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';

const orderService = new OrderService();

export class OrderController {

  async create(req: Request, res: Response) {
    try {
      const shopSlug = req.headers['x-tenant-id'] as string;

      if (!shopSlug) { 
        return res.status(400).json({ error: 'Falta el header x-tenant-id para identificar la tienda.' }); 
      }

      // solo esperamos buyer y la lista de items (id y cantidad)
      // el total y los precios los calculamos nosotros en el servicio.
      const { buyer, products } = req.body || {};

      if (!buyer) { return res.status(400).json({ error: 'El campo "buyer" es obligatorio.' }); }
      
      if (!products || !Array.isArray(products) || products.length === 0) { return res.status(400).json({ error: 'El campo "products" es obligatorio y debe ser un array no vacío.' }); }

      for (const p of products) {
        if (!p.productId || !p.quantity || p.quantity < 1) {
          return res.status(400).json({ error: 'Cada producto debe tener productId y quantity mayor a 0.' });
        }
      }

      const order = await orderService.createOrder(shopSlug, { buyer, products });

      res.status(201).json({
        message: 'Orden creada exitosamente',
        data: order
      });

    } catch (error: any) {
      console.error('Error creando orden:', error.message);
      
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({ // errores de validacion de mongoose
          error: 'Datos inválidos',
          details: error.message
        });
      }

      if (error.message.includes('no existe') || error.message.includes('Stock insuficiente')) {
          return res.status(409).json({ error: error.message }); // errores provenientes del servicio
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
      const { status } = req.body; // Esperamos { "status": "Enviado" }

      if (!shopSlug) return res.status(400).json({ error: 'Falta header x-tenant-id' });
      if (!status) return res.status(400).json({ error: 'El campo status es obligatorio' });
      
      const validStatuses = ['Pendiente', 'Pagado', 'Enviado', 'Cancelado'];
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
}