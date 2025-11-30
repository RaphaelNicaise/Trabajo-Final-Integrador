import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware, tenantMiddleware } from '../../../middleware/auth.middleware';

const router = Router();
const orderController = new OrderController();

// Ruta pública (cliente crea orden al comprar, requiere x-tenant-id)
router.post('/', tenantMiddleware, (req, res) => orderController.create(req, res));

// Rutas protegidas (panel de administración, requieren autenticación y x-tenant-id)
router.get('/', authMiddleware, tenantMiddleware, (req, res) => orderController.getAll(req, res));
router.get('/:id', authMiddleware, tenantMiddleware, (req, res) => orderController.getById(req, res));
router.put('/:id', authMiddleware, tenantMiddleware, (req, res) => orderController.updateStatus(req, res));

export default router;
