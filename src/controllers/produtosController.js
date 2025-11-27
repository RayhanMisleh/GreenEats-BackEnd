const { validarProduto } = require('../validators/produtoValidator');
const airtableService = require('../services/airtableService');

function validarProdutoHandler(req, res) {
  const resultado = validarProduto(req.body || {});
  const statusCode = resultado.valido ? 200 : 400;
  res.status(statusCode).json(resultado);
}

async function criarProduto(req, res, next) {
  try {
    const resultado = validarProduto(req.body || {});
    if (!resultado.valido) {
      return res.status(400).json(resultado);
    }

    const produtoCriado = await airtableService.criarProduto(req.body);
    return res.status(201).json(produtoCriado);
  } catch (error) {
    return next(error);
  }
}

async function listarProdutos(req, res, next) {
  try {
    const produtos = await airtableService.listarProdutos();
    return res.json(produtos);
  } catch (error) {
    return next(error);
  }
}

async function buscarProdutoPorId(req, res, next) {
  try {
    const { id } = req.params;
    const produto = await airtableService.buscarProdutoPorId(id);

    if (!produto) {
      return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }

    return res.json(produto);
  } catch (error) {
    return next(error);
  }
}

async function atualizarProduto(req, res, next) {
  try {
    const { id } = req.params;
    const produtoExistente = await airtableService.buscarProdutoPorId(id);

    if (!produtoExistente) {
      return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }

    const dadosCombinados = { ...produtoExistente, ...req.body };
    const resultado = validarProduto(dadosCombinados);

    if (!resultado.valido) {
      return res.status(400).json(resultado);
    }

    const produtoAtualizado = await airtableService.atualizarProduto(id, dadosCombinados);
    return res.json(produtoAtualizado);
  } catch (error) {
    return next(error);
  }
}

async function deletarProduto(req, res, next) {
  try {
    const { id } = req.params;
    const produtoExistente = await airtableService.buscarProdutoPorId(id);

    if (!produtoExistente) {
      return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }

    await airtableService.deletarProduto(id);
    return res.status(204).send();
  } catch (error) {
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
