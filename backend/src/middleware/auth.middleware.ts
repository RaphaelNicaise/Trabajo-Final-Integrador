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
  const token = authHeader?.replace('Bearer ', '');

  
  if (!token) {
    res.status(401).json({ message: 'Token no proporcionado' });
    return;
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-change-in-production');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
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
