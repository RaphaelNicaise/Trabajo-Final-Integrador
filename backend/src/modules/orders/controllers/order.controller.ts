import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';

const orderService = new OrderService();

export class OrderController {

  async create(req: Request, res: Response) {
    try {
      const shopSlug = req.headers['x-tenant-id'] as string;

      if (!shopSlug) { return res.status(400).json({ error: 'Falta el header x-tenant-id para identificar la tienda.' }); }

      const { buyer, products, total } = req.body || {};

      if (!buyer) { return res.status(400).json({ error: 'El campo "buyer" es obligatorio.' }); }
      if (!products || !Array.isArray(products) || products.length === 0) { return res.status(400).json({ error: 'El campo "products" es obligatorio y debe ser un array no vacío.' }); }
      if (total === undefined || total === null || total < 0) { return res.status(400).json({ error: 'El campo "total" es obligatorio y debe ser mayor o igual a 0.' }); }

      const orderData = {
        ...req.body
      };

      const order = await orderService.createOrder(shopSlug, orderData);

      res.status(201).json({
        message: 'Orden creada exitosamente',
        data: order
      });

    } catch (error: any) {

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Datos inválidos',
          details: error.message
        });
      }

      res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
  }


  async getAll(req: Request, res: Response) {
    try {
      const shopId = req.headers['x-tenant-id'] as string;

      if (!shopId) {
        return res.status(400).json({ error: 'Falta el header x-tenant-id.' });
      }

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

      if (!order) {
        return res.status(404).json({ error: 'Orden no encontrada' });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const shopSlug = req.headers['x-tenant-id'] as string;
      const { id } = req.params;

      if (!shopSlug) return res.status(400).json({ error: 'Falta header x-tenant-id' });
      if (!id) return res.status(400).json({ error: 'Falta el ID de la orden' });

      const currentOrder = await orderService.getOrderById(shopSlug, id);
      if (!currentOrder) {
        return res.status(404).json({ error: 'Orden no encontrada' });
      }

      const updateData = { ...req.body };

      const updatedOrder = await orderService.updateOrder(shopSlug, id, updateData);

      res.json({
        message: 'Orden actualizada correctamente',
        data: updatedOrder
      });

    } catch (error: any) {
      console.error('Error actualizando orden:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const shopSlug = req.headers['x-tenant-id'] as string;
      const { id } = req.params;

      if (!shopSlug) return res.status(400).json({ error: 'Falta header x-tenant-id' });
      if (!id) return res.status(400).json({ error: 'Falta el ID de la orden' });

      const order = await orderService.getOrderById(shopSlug, id);

      if (!order) {
        return res.status(404).json({ error: 'Orden no encontrada' });
      }

      await orderService.deleteOrder(shopSlug, id);

      res.json({ message: 'Orden eliminada correctamente' });

    } catch (error: any) {
      console.error('Error eliminando orden:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
