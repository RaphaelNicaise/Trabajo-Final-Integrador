import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extender el tipo Request para incluir user y tenantId
declare global {
  namespace Express {
    interface Request {
      user?: any;
      tenantId?: string;
    }
  }
}

/**
 * Middleware de autenticación JWT
 * Valida el token Bearer en el header Authorization
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ message: 'Token no proporcionado' });
    return;
  }

  // Extraer token: soporta "Bearer token" o solo "token"
  let token: string;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7); // Remueve "Bearer "
  } else {
    token = authHeader; // Si no tiene "Bearer ", asume que es solo el token
  }

  if (!token || token.trim() === '') {
    res.status(401).json({ message: 'Token no proporcionado' });
    return;
  }
  
  try {
    const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    const decoded = jwt.verify(token.trim(), secret);
    req.user = decoded;
    next();
  } catch (error: any) {
    console.error('Error al verificar token:', error.message);
    res.status(401).json({ message: 'Token inválido', error: error.message });
    return;
  }
};

/**
 * Middleware de multitenancy
 * Valida y extrae el x-tenant-id del header
 */
export const tenantMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const tenantId = req.headers['x-tenant-id'] as string;
  
  if (!tenantId) {
    res.status(400).json({ message: 'x-tenant-id requerido' });
    return;
  }
  
  req.tenantId = tenantId;
  next();
};
