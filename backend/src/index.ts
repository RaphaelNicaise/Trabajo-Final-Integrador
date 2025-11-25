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
    // 1. Conectamos a la Base de Datos
    await connectToMongoDB();
    // El console.log de "Conexión exitosa" ya está dentro de esa función,
    // pero si quieres uno extra aquí, podrías ponerlo.

    // 2. Iniciamos el servidor Express solo si la DB conectó bien
    app.listen(PORT, () => {
      console.log(`Server corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Error crítico al iniciar la aplicación:', error);
    process.exit(1); // Salir si la DB falla
  }
};

// Ejecutamos la función
startServer();