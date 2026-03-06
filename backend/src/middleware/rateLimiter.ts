import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '@/config/redis';

let globalLimiter: any = null;
let authLimiter: any = null;

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