import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// POST /api/auth/register
// Body: { name, email, password }
router.post('/register', (req, res) => authController.register(req, res));

// POST /api/auth/login
// Body: { email, password }
router.post('/login', (req, res) => authController.login(req, res));

// GET /api/auth/users 
router.get('/users', (req, res) => authController.getAll(req, res));

export default router;