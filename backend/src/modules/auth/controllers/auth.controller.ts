import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

// Función para generar JWT
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign(
    { userId },
    secret,
    { expiresIn } as jwt.SignOptions
  );
};

export class AuthController {

  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Faltan campos obligatorios (name, email, password).' });
      }

      const user = await authService.register({ name, email, password });

      const userResponse = user.toObject();
      delete (userResponse as any).passwordHash;

      // Generar token JWT
      const token = generateToken((user as any)._id.toString());

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: userResponse,
        token
      });

    } catch (error: any) {
      console.error('Error en registro:', error.message);
      
      if (error.message.includes('ya está registrado')) {
          return res.status(409).json({ error: error.message });
      }
      
      if (error.name === 'ValidationError') {
          return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
      }

      const user = await authService.login({ email, password });
      const userResponse = user.toObject();
      delete (userResponse as any).passwordHash;

      // Generar token JWT
      const token = generateToken((user as any)._id.toString());

      res.status(200).json({
        message: 'Login exitoso',
        user: userResponse,
        token
      });

    } catch (error: any) {
      console.error('Error en login:', error.message);
      
      if (error.message.includes('inválidas')) {
          return res.status(401).json({ error: error.message });
      }
      
      res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async getAll(req: Request, res: Response) {
      try {
          const users = await authService.getAllUsers();
          res.json(users);
      } catch (error: any) {
          res.status(500).json({ error: error.message });
      }
  }
}