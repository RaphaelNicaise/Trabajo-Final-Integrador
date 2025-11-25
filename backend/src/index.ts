import express from 'express';
import dotenv from 'dotenv';

import { connectToMongoDB } from './modules/database/tenantConnection';

import paymentsRoutes from "./modules/payments/routes/payments";
import productRoutes from './modules/products/routes/product.routes';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/', (req, res) => res.send('Backend corriendo 🚀'));
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK'});
});

app.use('/api/products', productRoutes);

const startServer = async () => {
  try {
    await connectToMongoDB();

    app.listen(PORT, () => {
      console.log(`Server corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Error crítico al iniciar la aplicación:', error);
    process.exit(1);
  }
}

startServer();