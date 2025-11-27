const express = require('express');
const cors = require('cors');
require('dotenv').config();

const produtosRoutes = require('./routes/produtosRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/', produtosRoutes);

// Simple heartbeat route to help with uptime checks
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Centralized error handler to avoid duplicated try/catch responses
app.use((err, req, res, next) => {
  console.error('Erro inesperado:', err);
  const status = err.statusCode || 500;
  res.status(status).json({ mensagem: 'Erro interno no servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor GreenEats rodando na porta ${PORT}`);
});
