import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '@/config/redis';

/**
 * Rate limiter general: 100 requests por ventana de 15 minutos por IP.
 * Usa Redis como store para funcionar correctamente con múltiples instancias.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos.',
  },
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
});

/**
 * Rate limiter estricto para autenticación: 20 requests por ventana de 15 minutos.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos.',
  },
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
});
