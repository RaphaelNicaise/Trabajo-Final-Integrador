import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authMiddleware, tenantMiddleware } from '../../../middleware/auth.middleware';

const router = Router();
const categoryController = new CategoryController();

// Rutas públicas (requieren x-tenant-id pero no autenticación)
router.get('/', tenantMiddleware, (req, res) => categoryController.getAll(req, res));

// Rutas protegidas (requieren autenticación y x-tenant-id)
router.post('/', authMiddleware, tenantMiddleware, (req, res) => categoryController.create(req, res));
router.put('/:id', authMiddleware, tenantMiddleware, (req, res) => categoryController.update(req, res));
router.delete('/:id', authMiddleware, tenantMiddleware, (req, res) => categoryController.delete(req, res));

export default router;