import { Request, Response } from 'express';

import { ProductService } from '../services/product.service';
import { StorageService } from '../../storage/services/storage.service';

const storageService = new StorageService();
const productService = new ProductService();

export class ProductController {

  async create(req: Request, res: Response) { 
    console.log('--- [ProductController] Iniciando creación de producto ---');
    try {
      // 1. Validar Header
      const shopSlug = req.headers['x-tenant-id'] as string;
      console.log('1. Header x-tenant-id recibido:', shopSlug);

      if (!shopSlug) {
        console.warn('❌ Error: Falta el header x-tenant-id');
        return res.status(400).json({ error: 'Falta el header x-tenant-id para identificar la tienda.' });
      }

      // 2. Revisar el Body y Validar Campos Obligatorios
      // Esto previene crashes si el body llega vacío o malformado
      console.log('2. Datos del Body:', req.body);
      
      const { name, price } = req.body || {};
      
      if (!name) {
        return res.status(400).json({ error: 'El campo "name" es obligatorio.' });
      }
      
      // Verificamos que price exista y no sea una cadena vacía (el 0 es válido)
      if (price === undefined || price === null || price === '') {
        return res.status(400).json({ error: 'El campo "price" es obligatorio.' });
      }

      console.log('3. Archivo recibido (req.file):', req.file ? `Sí (${req.file.originalname})` : 'No');

      let imageUrl = null; 

      // 3. Subir Imagen (solo si la validación básica pasó)
      if (req.file) {
        console.log('--- Intentando subir imagen a MinIO/S3 ---');
        try {
          imageUrl = await storageService.uploadProductImage(shopSlug, req.file);
          console.log('✅ Imagen subida exitosamente. URL:', imageUrl);
        } catch (uploadError) {
          console.error('❌ Error al subir imagen:', uploadError);
          // Decidimos fallar la creación si la imagen no se pudo subir, para mantener consistencia
          return res.status(500).json({ error: 'Error al subir la imagen al almacenamiento.' });
        }
      }

      // 4. Preparar datos
      const productData = {
        ...req.body,
        imageUrl: imageUrl 
      };
      console.log('4. Datos finales a guardar en MongoDB:', productData);

      // 5. Guardar en DB
      console.log(`--- Conectando a DB tenant: ${shopSlug} ---`);
      const product = await productService.createProduct(shopSlug, productData);
      console.log('✅ Producto creado en DB:', product._id);
      
      res.status(201).json({
        message: 'Producto creado exitosamente',
        data: product
      });

    } catch (error: any) {
      console.error('❌ Error CRÍTICO en [ProductController.create]:', error);

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