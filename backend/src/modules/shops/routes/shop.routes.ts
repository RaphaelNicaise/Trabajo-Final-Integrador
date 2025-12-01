import { Router } from 'express';
import { ShopController } from '../controllers/shop.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();
const shopController = new ShopController();

// Rutas públicas (sin autenticación)
router.get('/', (req, res) => shopController.getAll(req, res));
router.get('/:slug', (req, res) => shopController.getBySlug(req, res));

// Rutas protegidas (requieren autenticación)
router.get('/user/:userId', authMiddleware, (req, res) => shopController.getByUserId(req, res));
router.post('/', authMiddleware, (req, res) => shopController.create(req, res));
router.put('/:slug', authMiddleware, (req, res) => shopController.update(req, res));
router.delete('/:slug', authMiddleware, (req, res) => shopController.delete(req, res));


export default router;
