import { redisClient } from '../../../config/redis';

export class CacheService {
  /**
   * Verifica si el cliente está conectado y listo para recibir comandos.
   * Esto previene el error 'ClientClosedError'.
   */
  private static isReady(): boolean {
    return redisClient.isOpen && redisClient.isReady;
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isReady()) {
        console.warn(`⚠️ [CacheService] Redis no disponible. Saltando GET para: ${key}`);
        return null;
      }
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`[CacheService] Error obteniendo key "${key}":`, error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      if (!this.isReady()) {
        console.warn(`⚠️ [CacheService] Redis no disponible. Saltando SET para: ${key}`);
        return;
      }
      const stringValue = JSON.stringify(value);
      await redisClient.set(key, stringValue, {
        EX: ttl,
      });
    } catch (error) {
      console.error(`[CacheService] Error guardando key "${key}":`, error);
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      if (!this.isReady()) {
        console.warn(`⚠️ [CacheService] Redis no disponible. Saltando DELETE para: ${key}`);
        return;
      }
      await redisClient.del(key);
    } catch (error) {
      console.error(`[CacheService] Error eliminando key "${key}":`, error);
    }
  }

  static async deleteByPattern(pattern: string): Promise<void> {
    try {
      if (!this.isReady()) {
        console.warn(`⚠️ [CacheService] Redis no disponible. Saltando DELETE por patrón: ${pattern}`);
        return;
      }
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error(`[CacheService] Error eliminando patrón "${pattern}":`, error);
    }
  }
}