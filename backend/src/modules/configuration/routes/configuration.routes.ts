import { Router } from 'express';
import { ConfigurationController } from '../controllers/configuration.controller';
import { authMiddleware, tenantMiddleware } from '../../../middleware/auth.middleware';

const router = Router();
const controller = new ConfigurationController();

// Public routes (require tenant id)
router.get('/public', tenantMiddleware, (req, res) => controller.getPublic(req, res));

// Protected routes (admin)
router.get('/', authMiddleware, tenantMiddleware, (req, res) => controller.getAll(req, res));
router.post('/', authMiddleware, tenantMiddleware, (req, res) => controller.upsert(req, res));
router.delete('/:key', authMiddleware, tenantMiddleware, (req, res) => controller.delete(req, res));

export default router;
