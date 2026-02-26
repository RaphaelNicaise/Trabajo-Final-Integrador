import { Router } from 'express';
import { OrderController } from '@/modules/orders/controllers/order.controller';
import { authMiddleware, tenantMiddleware } from '@/middleware/auth.middleware';

const router = Router();
const orderController = new OrderController();

// Rutas públicas (cliente)
router.post('/', tenantMiddleware, (req, res) => orderController.create(req, res));
router.post('/shipping-quote', tenantMiddleware, (req, res) => orderController.shippingQuote(req, res));

// Rutas protegidas (panel de administración)
router.get('/', authMiddleware, tenantMiddleware, (req, res) => orderController.getAll(req, res));
router.get('/:id', authMiddleware, tenantMiddleware, (req, res) => orderController.getById(req, res));
router.get('/:id/pdf', authMiddleware, tenantMiddleware, (req, res) => orderController.downloadPDF(req, res));
router.put('/:id', authMiddleware, tenantMiddleware, (req, res) => orderController.updateStatus(req, res));

export default router;
