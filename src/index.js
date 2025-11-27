const createApp = require('./app');
const logger = require('./logger');

const PORT = process.env.PORT || 3000;

const app = createApp();

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
