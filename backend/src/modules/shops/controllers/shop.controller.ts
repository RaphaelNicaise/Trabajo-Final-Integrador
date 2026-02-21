import { Request, Response } from 'express';
import { ShopService } from '../services/shop.service';
import { StorageService } from '../../storage/services/storage.service';

const shopService = new ShopService();
const storageService = new StorageService();

export class ShopController {
  async create(req: Request, res: Response) {
    try {
      const { userId, slug, storeName, location, description } = req.body;
      if (!userId || !slug || !storeName) {
        return res.status(400).json({ error: 'Faltan datos obligatorios (userId, slug, storeName)' });
      }
      const shop = await shopService.createShop({
        userId, slug, storeName, location, description
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
      const requestingUserId = req.user?.userId;

      if (!slug) {
        return res.status(400).json({ error: 'Falta el slug de la tienda' });
      }
      if (!requestingUserId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const deletedShop = await shopService.deleteShop(slug, requestingUserId);
      if (!deletedShop) {
        return res.status(404).json({ error: 'Tienda no encontrada' });
      }
      res.status(200).json({ message: 'Tienda eliminada correctamente' });
    } catch (error: any) {
      if (error.message.includes('Solo el propietario')) {
        return res.status(403).json({ error: error.message });
      }
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

  async getBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      if (!slug) {
        return res.status(400).json({ error: 'Falta el slug de la tienda' });
      }
      const shop = await shopService.getShopBySlug(slug);
      if (!shop) {
        return res.status(404).json({ error: 'Tienda no encontrada' });
      }
      res.status(200).json(shop);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async uploadLogo(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const file = req.file;

      if (!slug) {
        return res.status(400).json({ error: 'Falta el slug de la tienda' });
      }
      if (!file) {
        return res.status(400).json({ error: 'No se proporcionó un archivo de imagen' });
      }

      // Subir imagen al storage
      const imageUrl = await storageService.uploadLogoShop(slug, file);

      // Actualizar el campo imageUrl en el Tenant
      const updatedShop = await shopService.updateShop(slug, { imageUrl } as any);

      if (!updatedShop) {
        return res.status(404).json({ error: 'Tienda no encontrada' });
      }

      res.status(200).json({ imageUrl, message: 'Logo actualizado exitosamente' });
    } catch (error: any) {
      console.error('Error al subir logo:', error.message);
      res.status(500).json({ error: error.message });
    }
  }

  async getMembers(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      if (!slug) {
        return res.status(400).json({ error: 'Falta el slug de la tienda' });
      }
      const members = await shopService.getMembers(slug);
      res.status(200).json(members);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async addMember(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const { email } = req.body;
      const requestingUserId = req.user?.userId;

      if (!slug) {
        return res.status(400).json({ error: 'Falta el slug de la tienda' });
      }
      if (!email) {
        return res.status(400).json({ error: 'Se requiere el email del usuario a agregar' });
      }
      if (!requestingUserId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const member = await shopService.addMember(slug, email, requestingUserId);
      res.status(201).json(member);
    } catch (error: any) {
      if (error.message.includes('Solo el propietario') || error.message.includes('ya es miembro')) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes('No se encontró')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async removeMember(req: Request, res: Response) {
    try {
      const { slug, userId } = req.params;
      const requestingUserId = req.user?.userId;

      if (!slug || !userId) {
        return res.status(400).json({ error: 'Faltan parámetros' });
      }
      if (!requestingUserId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const result = await shopService.removeMember(slug, userId, requestingUserId);
      res.status(200).json(result);
    } catch (error: any) {
      if (
        error.message.includes('Solo el propietario') ||
        error.message.includes('no puede eliminarse') ||
        error.message.includes('No eres miembro') ||
        error.message.includes('No se puede eliminar al propietario')
      ) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes('no encontrad')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}
