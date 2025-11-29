import express from 'express';
import dotenv from 'dotenv';

import { connectToMongoDB } from './modules/database/tenantConnection';
import { StorageService } from './modules/storage/services/storage.service';

import paymentsRoutes from "./modules/payments/routes/payments";
import productRoutes from './modules/products/routes/product.routes';
import shopRoutes from './modules/shops/routes/shop.routes';
import categoryRoutes from './modules/categories/routes/category.routes';
import orderRoutes from './modules/orders/routes/order.routes';
import authRoutes from './modules/auth/routes/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const storageService = new StorageService();

app.use(express.json());

app.get('/', (req, res) => res.send('Backend corriendo 🚀'));
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK'});
});

app.use('/api/products', productRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

const startServer = async () => {
  try {
    await connectToMongoDB();
    await storageService.initializeMainBucket();
    app.listen(PORT, ()  => {
      console.log(`Server corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Error crítico al iniciar la aplicación:', error);
    process.exit(1);
  }
}

startServer();