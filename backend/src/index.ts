import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectToMongoDB } from '@/modules/database/tenantConnection';
import { StorageService } from '@/modules/storage/services/storage.service';
import { redisClient } from '@/config/redis'
import { apiKeyGuard } from '@/middleware/apiKeyGuard';
import { verifyMailConnection } from '@/config/mail';

import paymentsRoutes from "@/modules/payments/routes/payments";
import productRoutes from '@/modules/products/routes/product.routes';
import shopRoutes from '@/modules/shops/routes/shop.routes';
import categoryRoutes from '@/modules/categories/routes/category.routes';
import orderRoutes from '@/modules/orders/routes/order.routes';
import configurationRoutes from '@/modules/configuration/routes/configuration.routes';
import authRoutes from '@/modules/auth/routes/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const storageService = new StorageService();

// Configurar CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'], // Next.js dev server + Vite legacy
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-api-key'],
}));

app.use(express.json());

app.get('/', (req, res) => res.send('Backend corriendo'));
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/', apiKeyGuard);

// Rutas con protección selectiva (definen middlewares a nivel de ruta individual)
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/configurations', configurationRoutes);

const startServer = async () => {
  try {
    await redisClient.connect();
    await connectToMongoDB();
    await storageService.initializeMainBucket();
    await verifyMailConnection();
    
    app.listen(PORT, () => {
      console.log(`Server corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Error crítico al iniciar la aplicación:', error);
    process.exit(1);
  }
}

startServer();