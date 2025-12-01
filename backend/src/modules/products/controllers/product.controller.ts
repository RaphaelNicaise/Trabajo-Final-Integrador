import { Request, Response } from 'express';

import { ProductService } from '../services/product.service';
import { StorageService } from '../../storage/services/storage.service';

const storageService = new StorageService();
const productService = new ProductService();

export class ProductController {

  async create(req: Request, res: Response) { 
    try {
      const shopSlug = req.headers['x-tenant-id'] as string;

      if (!shopSlug) {return res.status(400).json({ error: 'Falta el header x-tenant-id para identificar la tienda.' });}
      
      const { name, price, categories  } = req.body || {};
      
      if (!name) {return res.status(400).json({ error: 'El campo "name" es obligatorio.' });}      
      if (price === undefined || price === null || price === '') { return res.status(400).json({ error: 'El campo "price" es obligatorio.' });}

      let imageUrl = null; 

      if (req.file) {
        try {
          imageUrl = await storageService.uploadProductImage(shopSlug, req.file);
        } catch (uploadError) {
          return res.status(500).json({ error: 'Error al subir la imagen al almacenamiento.' });
        }
      }
      
      const productData = {
        ...req.body,
        imageUrl: imageUrl,
        categories: this.parseCategories(categories)
      };

      const product = await productService.createProduct(shopSlug, productData);
      
      res.status(201).json({
        message: 'Producto creado exitosamente',
        data: product
      });

    } catch (error: any) {

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
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const shopSlug = req.headers['x-tenant-id'] as string;
      const { id } = req.params;
      if (!shopSlug) return res.status(400).json({ error: 'Falta header x-tenant-id' });
      if (!id) return res.status(400).json({ error: 'Falta el ID del producto' });

      const product = await productService.getProductById(shopSlug, id);

      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const shopSlug = req.headers['x-tenant-id'] as string;
      const { id } = req.params; // ID del producto a editar

      if (!shopSlug) return res.status(400).json({ error: 'Falta header x-tenant-id' });
      if (!id) return res.status(400).json({ error: 'Falta el ID del producto' });

      const currentProduct = await productService.getProductById(shopSlug, id);
      if (!currentProduct) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      const updateData = { ...req.body };

      if (req.body.categories) {
        updateData.categories = this.parseCategories(req.body.categories);
      }

      if (req.file) {
        
        const newImageUrl = await storageService.uploadProductImage(shopSlug, req.file);
        updateData.imageUrl = newImageUrl;

  
        if (currentProduct.imageUrl) {
            await storageService.deleteFile(currentProduct.imageUrl); 
        }
      }

      const updatedProduct = await productService.updateProduct(shopSlug, id, updateData);

      res.json({
        message: 'Producto actualizado correctamente',
        data: updatedProduct
      });

    } catch (error: any) {
      console.error('Error actualizando producto:', error);
      if (error.code === 11000) return res.status(400).json({ error: 'El nombre ya está en uso por otro producto.' });
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const shopSlug = req.headers['x-tenant-id'] as string;
      const { id } = req.params;

      if (!shopSlug) return res.status(400).json({ error: 'Falta header x-tenant-id' });
      if (!id) return res.status(400).json({ error: 'Falta el ID del producto' });

      const product = await productService.getProductById(shopSlug, id);
      
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      if (product.imageUrl) {
        console.log(`Eliminando imagen asociada: ${product.imageUrl}`);
        await storageService.deleteFile(product.imageUrl);
      }

      await productService.deleteProduct(shopSlug, id);

      res.json({ message: 'Producto eliminado correctamente' });

    } catch (error: any) {
      console.error('Error eliminando producto:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // metodo para parsear categorias desde el req.body
  private parseCategories(categoriesInput: any): any[] {
    if (!categoriesInput) return [];
    
    if (typeof categoriesInput === 'string') {
        try {
            const parsed = JSON.parse(categoriesInput);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            return [categoriesInput];
        }
        return [categoriesInput];
    }
    if (Array.isArray(categoriesInput)) return categoriesInput;
    
    return [];
  }
}