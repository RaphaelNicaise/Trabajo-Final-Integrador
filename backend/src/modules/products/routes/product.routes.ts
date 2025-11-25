import { Router } from 'express';
import multer from 'multer';
import { ProductController } from '../controllers/product.controller';

const router = Router();
const productController = new ProductController();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5mb
});

// Definimos las rutas
// GET /api/products (Requiere header x-tenant-id)
router.get('/', (req, res) => productController.getAll(req, res));

// POST /api/products (Requiere header x-tenant-id)
router.post('/', upload.single('image'), (req, res) => productController.create(req, res));

export default router;