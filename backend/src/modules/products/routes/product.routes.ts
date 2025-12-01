import { Router } from 'express';
import multer from 'multer';
import { ProductController } from '../controllers/product.controller';
import { authMiddleware, tenantMiddleware } from '../../../middleware/auth.middleware';

const router = Router();
const productController = new ProductController();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5mb
});

// Rutas públicas (requieren x-tenant-id pero no autenticación)
router.get('/', tenantMiddleware, (req, res) => productController.getAll(req, res));
router.get('/:id', tenantMiddleware, (req, res) => productController.getById(req, res));

// Rutas protegidas (requieren autenticación y x-tenant-id)
router.post('/', authMiddleware, tenantMiddleware, upload.single('image'), (req, res) => productController.create(req, res));
router.put('/:id', authMiddleware, tenantMiddleware, upload.single('image'), (req, res) => productController.update(req, res));
router.delete('/:id', authMiddleware, tenantMiddleware, (req, res) => productController.delete(req, res));

export default router;