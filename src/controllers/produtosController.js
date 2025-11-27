const { validarProduto } = require('../validators/produtoValidator');
const airtableService = require('../services/airtableService');
const logger = require('../logger');

function validarProdutoHandler(req, res) {
  const resultado = validarProduto(req.body || {});
  const statusCode = resultado.valido ? 200 : 400;
  logger.info('Validacao produto', { path: req.path, valido: resultado.valido, erros: resultado.erros });
  res.status(statusCode).json(resultado);
}

async function criarProduto(req, res, next) {
  try {
    const resultado = validarProduto(req.body || {});
    if (!resultado.valido) {
      logger.warn('Falha de validacao ao criar produto', { body: req.body, erros: resultado.erros });
      return res.status(400).json(resultado);
    }

    const produtoCriado = await airtableService.criarProduto(req.body);
    logger.info('Produto criado', { id: produtoCriado.id, titulo: produtoCriado.titulo });
    return res.status(201).json(produtoCriado);
  } catch (error) {
    logger.error('Erro ao criar produto', { error: error.message, stack: error.stack });
    return next(error);
  }
}

async function listarProdutos(req, res, next) {
  try {
    const produtos = await airtableService.listarProdutos();
    logger.info('Listagem de produtos', { count: produtos.length });
    return res.json(produtos);
  } catch (error) {
    logger.error('Erro ao listar produtos', { error: error.message, stack: error.stack });
    return next(error);
  }
}

async function buscarProdutoPorId(req, res, next) {
  try {
    const { id } = req.params;
    const produto = await airtableService.buscarProdutoPorId(id);

    if (!produto) {
      logger.warn('Produto nao encontrado', { id });
      return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }

    logger.info('Produto encontrado', { id });
    return res.json(produto);
  } catch (error) {
    logger.error('Erro ao buscar produto por id', { error: error.message, stack: error.stack });
    return next(error);
  }
}

async function atualizarProduto(req, res, next) {
  try {
    const { id } = req.params;
    const produtoExistente = await airtableService.buscarProdutoPorId(id);

    if (!produtoExistente) {
      logger.warn('Tentativa de atualizar produto inexistente', { id });
      return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }

    const dadosCombinados = { ...produtoExistente, ...req.body };
    const resultado = validarProduto(dadosCombinados);

    if (!resultado.valido) {
      logger.warn('Falha de validacao ao atualizar produto', { id, erros: resultado.erros });
      return res.status(400).json(resultado);
    }

    const produtoAtualizado = await airtableService.atualizarProduto(id, dadosCombinados);
    logger.info('Produto atualizado', { id });
    return res.json(produtoAtualizado);
  } catch (error) {
    logger.error('Erro ao atualizar produto', { error: error.message, stack: error.stack });
    return next(error);
  }
}

async function deletarProduto(req, res, next) {
  try {
    const { id } = req.params;
    const produtoExistente = await airtableService.buscarProdutoPorId(id);

    if (!produtoExistente) {
      logger.warn('Tentativa de deletar produto inexistente', { id });
      return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }

    await airtableService.deletarProduto(id);
    logger.info('Produto deletado', { id });
    return res.status(204).send();
  } catch (error) {
    logger.error('Erro ao deletar produto', { error: error.message, stack: error.stack });
    return next(error);
  }
}

module.exports = {
  validarProdutoHandler,
  criarProduto,
  listarProdutos,
  buscarProdutoPorId,
  atualizarProduto,
  deletarProduto,
};
