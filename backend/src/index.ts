import express from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('Backend corriendo 🚀');
});

app.listen(PORT, () => {
  console.log(`Server corriendo en http://localhost:${PORT}`);
});
