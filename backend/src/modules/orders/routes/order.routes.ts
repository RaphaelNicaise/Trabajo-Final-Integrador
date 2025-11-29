import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';

const router = Router();
const orderController = new OrderController();


router.get('/', (req, res) => orderController.getAll(req, res));
router.get('/:id', (req, res) => orderController.getById(req, res));
router.post('/', (req, res) => orderController.create(req, res));
router.put('/:id', (req, res) => orderController.updateStatus(req, res));

export default router;
