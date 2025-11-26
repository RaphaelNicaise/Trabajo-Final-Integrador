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
// /api/products (Requieren header x-tenant-id)
router.get('/', (req, res) => productController.getAll(req, res));
router.get('/:id', (req, res) => productController.getById(req, res));
router.post('/', upload.single('image'), (req, res) => productController.create(req, res));
router.put('/:id', upload.single('image'), (req, res) => productController.update(req, res));
router.delete('/:id', (req, res) => productController.delete(req, res));

export default router;