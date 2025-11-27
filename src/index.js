const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const produtosRoutes = require('./routes/produtosRoutes');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan(process.env.LOG_FORMAT || 'dev', { stream: logger.stream }));

app.use('/', produtosRoutes);

app.get('/', (req, res) => {
  res.json({
    mensagem: 'GreenEats API ativa. Use /produtos, /validar-produto ou /health.',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  logger.error('Erro inesperado', { message: err.message, stack: err.stack });
  const status = err.statusCode || 500;
  res.status(status).json({ mensagem: 'Erro interno no servidor' });
});

const server = app.listen(PORT, () => {
  logger.info(`Servidor GreenEats rodando na porta ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Porta ${PORT} já está em uso. Use outra porta (ex: PORT=4000) ou mate o processo que está rodando nesta porta.`);
    process.exit(1);
  }
  logger.error('Erro no servidor', { message: err.message, stack: err.stack });
  process.exit(1);
});
