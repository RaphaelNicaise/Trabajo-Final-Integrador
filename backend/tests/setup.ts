import { connectToMongoDB } from '../src/modules/database/tenantConnection';
import { redisClient } from '../src/config/redis';
import { StorageService } from '../src/modules/storage/services/storage.service';
import mongoose from 'mongoose';

const storageService = new StorageService();

beforeAll(async () => {
  // Inicializamos la conexión real de la app
  await connectToMongoDB();

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  // Inicializamos el bucket de Minio para que las tiendas puedan crearse
  await storageService.initializeMainBucket();
});

afterAll(async () => {
  // Cerramos todas las conexiones de forma limpia
  await mongoose.disconnect();
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
});
