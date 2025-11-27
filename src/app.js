const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const produtosRoutes = require('./routes/produtosRoutes');
const logger = require('./logger');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // HTTP request logging via morgan -> logger
  app.use(morgan(process.env.LOG_FORMAT || 'dev', { stream: logger.stream }));

  app.use('/', produtosRoutes);

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  // centralized error handler
  app.use((err, req, res, next) => {
    logger.error('Erro inesperado', { message: err.message, stack: err.stack });
    const status = err.statusCode || 500;
    res.status(status).json({ mensagem: 'Erro interno no servidor' });
  });

  return app;
}

module.exports = createApp;
