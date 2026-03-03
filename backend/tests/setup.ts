import { connectToMongoDB } from '../src/modules/database/tenantConnection';
import { redisClient } from '../src/config/redis';
import { StorageService } from '../src/modules/storage/services/storage.service';
import { initializeRateLimiters } from '../src/middleware/rateLimiter';
import mongoose from 'mongoose';

const storageService = new StorageService();

beforeAll(async () => {
  await connectToMongoDB();

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  initializeRateLimiters();

  await storageService.initializeMainBucket();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
});