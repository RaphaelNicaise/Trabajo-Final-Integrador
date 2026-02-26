import { Router } from 'express';
import { AuthController } from '@/modules/auth/controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// POST /api/auth/register
// Body: { name, email, password }
router.post('/register', (req, res) => authController.register(req, res));

// POST /api/auth/login
// Body: { email, password }
router.post('/login', (req, res) => authController.login(req, res));

// GET /api/auth/confirm/:token
router.get('/confirm/:token', (req, res) => authController.confirmAccount(req, res));

// POST /api/auth/forgot-password
// Body: { email }
router.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));

// POST /api/auth/reset-password/:token
// Body: { password }
router.post('/reset-password/:token', (req, res) => authController.resetPassword(req, res));

// GET /api/auth/users 
router.get('/users', (req, res) => authController.getAll(req, res));

export default router;