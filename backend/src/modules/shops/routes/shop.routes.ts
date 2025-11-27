import { Router } from 'express';
import { ShopController } from '../controllers/shop.controller';

const router = Router();
const shopController = new ShopController();

router.post('/', (req, res) => shopController.create(req, res));
router.put('/:slug', (req, res) => shopController.update(req, res));
router.delete('/:slug', (req, res) => shopController.delete(req, res));

export default router;
