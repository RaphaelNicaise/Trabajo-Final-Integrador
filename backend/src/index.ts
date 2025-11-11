import express from 'express';
import paymentsRoutes from "./modules/payments/routes/payments";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/', (req, res) => res.send('Backend corriendo 🚀'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK'});
});

app.use("/payments", paymentsRoutes);

app.get('/success', (req, res) => {
  res.send('<h1>¡Pago exitoso!</h1>');
});

app.get('/failure', (req, res) => {
  res.send('<h1>Pago fallido</h1>');
});

app.get('/pending', (req, res) => {
  res.send('<h1>Pago pendiente</h1>');
});

app.listen(PORT, () => {
  console.log(`Server corriendo en http://localhost:${PORT}`);
});