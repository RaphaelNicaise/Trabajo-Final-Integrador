import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { Request, Response, NextFunction } from 'express';
import { redisClient } from '@/config/redis';

let globalLimiter: any = null;
let authLimiter: any = null;
const ADMIN_BYPASS_EMAIL = (process.env.ADMIN_BYPASS_EMAIL || 'admin@gmail.com').toLowerCase();
let authServicePromise: Promise<{ login: (credentials: { email: string; password?: string }) => Promise<any> }> | null = null;

const getAuthService = async () => {
  if (!authServicePromise) {
    authServicePromise = import('@/modules/auth/services/auth.service').then(({ AuthService }) => new AuthService());
  }
  return authServicePromise;
};

/**
 * Inicializa los rate limiters después de que Redis está conectado.
 * Se debe llamar después de `redisClient.connect()` en startServer()
 */
export const initializeRateLimiters = () => {
  const createStore = () => new RedisStore({
    sendCommand: (...args: string[]) => {
      try {
        return (redisClient.sendCommand as any)(args);
      } catch (err) {
        console.error('Error en RedisStore:', err);
        throw err;
      }
    },
  });

  globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos.',
    },
    store: createStore(),
  });

  authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos.',
    },
    store: createStore(),
  });
};

const noopMiddleware = (req: any, res: any, next: any) => next();

export const getGlobalLimiter = () => {
  if (process.env.NODE_ENV === 'test') return noopMiddleware;
  if (!globalLimiter) {
    throw new Error('Rate limiters no inicializados. Llama a initializeRateLimiters() primero.');
  }
  return globalLimiter;
};

export const getAuthLimiter = () => {
  if (process.env.NODE_ENV === 'test') return noopMiddleware;
  if (!authLimiter) {
    throw new Error('Rate limiters no inicializados. Llama a initializeRateLimiters() primero.');
  }
  return authLimiter;
};

export const authLimiterWithAdminBypass = async (req: Request, res: Response, next: NextFunction) => {
  const isLoginRoute = req.method === 'POST' && req.path === '/login';

  if (!isLoginRoute) {
    return getAuthLimiter()(req, res, next);
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : undefined;

  if (email === ADMIN_BYPASS_EMAIL && password) {
    try {
      const authService = await getAuthService();
      await authService.login({ email, password });
      return next();
    } catch {
      // Si las credenciales no son válidas, aplica el rate limiter normalmente.
    }
  }

  return getAuthLimiter()(req, res, next);
};