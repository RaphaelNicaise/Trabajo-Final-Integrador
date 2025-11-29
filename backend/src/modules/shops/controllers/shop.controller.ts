import { Request, Response } from 'express';
import { ShopService } from '../services/shop.service';

const shopService = new ShopService();

export class ShopController {
  async create(req: Request, res: Response) {
    try {
      // Como no hay Auth Middleware aún, recibimos el userId en el body (MOCK)
      const { userId, slug, storeName, ownerEmail, location, description } = req.body;
      if (!userId || !slug || !storeName || !ownerEmail) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
      }
      const shop = await shopService.createShop({
        userId, slug, storeName, ownerEmail, location, description
      });
      res.status(201).json(shop);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const { storeName, location, description } = req.body;
      if (!slug) {
        return res.status(400).json({ error: 'Falta el slug de la tienda' });
      }
      const updatedShop = await shopService.updateShop(slug, { storeName, location, description });
      if (!updatedShop) {
        return res.status(404).json({ error: 'Tienda no encontrada' });
      }
      res.status(200).json(updatedShop);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      if (!slug) {
        return res.status(400).json({ error: 'Falta el slug de la tienda' });
      }
      const deletedShop = await shopService.deleteShop(slug);
      if (!deletedShop) {
        return res.status(404).json({ error: 'Tienda no encontrada' });
      }
      res.status(200).json({ message: 'Tienda eliminada correctamente' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const shops = await shopService.getAllShops();
      res.status(200).json(shops);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ error: 'Falta el userId' });
      }
      const shops = await shopService.getUserShops(userId);
      res.status(200).json(shops);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
