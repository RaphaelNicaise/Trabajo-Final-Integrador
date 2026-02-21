import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de protección por API Key
 * Valida la API Key en el header x-api-key en todas las rutas de la API
 */
export const apiKeyGuard = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.header('x-api-key');
  const internalApiKey = process.env.INTERNAL_API_KEY;

  if (!internalApiKey) {
    console.error('INTERNAL_API_KEY no está configurada en las variables de entorno');
    res.status(500).json({
      message: 'Falta configurar INTERNAL_API_KEY en el servidor.'
    });
    return;
  }

  if (!apiKey) {
    res.status(403).json({
      message: 'Acceso denegado: Falta API Key. Se requiere el header x-api-key'
    });
    return;
  }

  if (apiKey !== internalApiKey) {
    res.status(403).json({
      message: 'Acceso denegado: API Key inválida'
    });
    return;
  }

  next();
};
