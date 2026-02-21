import { Router } from 'express';
import multer from 'multer';
import { ShopController } from '../controllers/shop.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'));
        }
    }
});

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
router.post('/:slug/logo', authMiddleware, upload.single('logo'), (req, res) => shopController.uploadLogo(req, res));

// Rutas de gestión de miembros
router.get('/:slug/members', authMiddleware, (req, res) => shopController.getMembers(req, res));
router.post('/:slug/members', authMiddleware, (req, res) => shopController.addMember(req, res));
router.delete('/:slug/members/:userId', authMiddleware, (req, res) => shopController.removeMember(req, res));

export default router;
