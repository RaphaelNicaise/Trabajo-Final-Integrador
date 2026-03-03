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
    max: 100,
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

/**
 * Retorna el rate limiter global
 */
export const getGlobalLimiter = () => {
  if (!globalLimiter) {
    throw new Error('Rate limiters no inicializados. Llama a initializeRateLimiters() primero.');
  }
  return globalLimiter;
};

/**
 * Retorna el rate limiter de autenticación
 */
export const getAuthLimiter = () => {
  if (!authLimiter) {
    throw new Error('Rate limiters no inicializados. Llama a initializeRateLimiters() primero.');
  }
  return authLimiter;
};
