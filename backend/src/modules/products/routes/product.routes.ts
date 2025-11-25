import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router = Router();
const productController = new ProductController();

// Definimos las rutas
// GET /api/products (Requiere header x-tenant-id)
router.get('/', (req, res) => productController.getAll(req, res));

// POST /api/products (Requiere header x-tenant-id)
router.post('/', (req, res) => productController.create(req, res));

export default router;