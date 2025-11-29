import { Router } from 'express';
import { ShopController } from '../controllers/shop.controller';

const router = Router();
const shopController = new ShopController();

router.get('/', (req, res) => shopController.getAll(req, res));
// router.get('/:slug', (req, res) => shopController.getBySlug(req, res));
router.get('/user/:userId', (req, res) => shopController.getByUserId(req, res));
router.post('/', (req, res) => shopController.create(req, res));
router.put('/:slug', (req, res) => shopController.update(req, res));
router.delete('/:slug', (req, res) => shopController.delete(req, res));


export default router;
