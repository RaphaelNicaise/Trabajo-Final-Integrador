import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';

const productService = new ProductService();

export class ProductController {

  async create(req: Request, res: Response) { // Crear producto
    try {
      // ID de la tienda viene en los headers (x-tenant-id)
      const shopId = req.headers['x-tenant-id'] as string;

      if (!shopId) {
        return res.status(400).json({ error: 'Falta el header x-tenant-id para identificar la tienda.' });
      }

      const product = await productService.createProduct(shopId, req.body);
      
      res.status(201).json({
        message: 'Producto creado exitosamente',
        data: product
      });

    } catch (error: any) {
      console.error('Error al crear producto:', error);

      if (error.code === 11000) { // error de clave duplicada de MongoDB
        return res.status(400).json({ 
          error: 'Ya existe un producto con este nombre en tu tienda.' 
        });
      }

      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          error: 'Datos inválidos',
          details: error.message 
        });
      }

      res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
  }


  async getAll(req: Request, res: Response) {   // Listar productos
    try {
      const shopId = req.headers['x-tenant-id'] as string;

      if (!shopId) {
        return res.status(400).json({ error: 'Falta el header x-tenant-id.' });
      }

      const products = await productService.getProducts(shopId);
      
      res.json(products);

    } catch (error: any) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ error: error.message });
    }
  }
}