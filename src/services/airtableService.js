const Airtable = require('airtable');
require('dotenv').config();
const logger = require('../logger');

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  logger.error('Variaveis Airtable nao definidas', { AIRTABLE_API_KEY: !!AIRTABLE_API_KEY, AIRTABLE_BASE_ID: !!AIRTABLE_BASE_ID });
  throw new Error('As variáveis AIRTABLE_API_KEY e AIRTABLE_BASE_ID são obrigatórias.');
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
const tabelaProdutos = base(AIRTABLE_TABLE_NAME || 'Produtos');

function mapearProduto(record) {
  const fields = record.fields || {};

  return {
    id: record.id,
    titulo: fields.Titulo || '',
    descricao: fields.Descricao || '',
    preco: Number(fields.Preco) || 0,
    categoria: fields.Categoria || '',
    estoque: fields.Estoque !== undefined ? Number(fields.Estoque) : undefined,
    dataCriacao: fields.DataCriacao || record._rawJson.createdTime,
  };
}

function montarCampos(dados = {}) {
  const campos = {};

  if (dados.titulo !== undefined) campos.Titulo = dados.titulo;
  if (dados.descricao !== undefined) campos.Descricao = dados.descricao;
  if (dados.preco !== undefined) campos.Preco = Number(dados.preco);
  if (dados.categoria !== undefined) campos.Categoria = dados.categoria;
  if (dados.estoque !== undefined) campos.Estoque = Number(dados.estoque);
  // Nota: não enviamos `DataCriacao` por padrão pois esse campo
  // pode ser do tipo "Created time" no Airtable (read-only).
  // O Airtable preencherá automaticamente a data de criação.

  return campos;
}

async function listarProdutos() {
  try {
    const records = await tabelaProdutos.select({
      sort: [{ field: 'DataCriacao', direction: 'desc' }],
    }).all();

    const produtos = records.map(mapearProduto);
    logger.info('Airtable listarProdutos', { count: produtos.length });
    return produtos;
  } catch (error) {
    logger.error('Airtable listarProdutos erro', { message: error.message, stack: error.stack });
    throw error;
  }
}

async function criarProduto(dados) {
  try {
    // Não enviamos DataCriacao — deixamos o Airtable definir o createdTime
    const campos = montarCampos(dados);

    const [record] = await tabelaProdutos.create([{ fields: campos }]);
    const produto = mapearProduto(record);
    logger.info('Airtable criarProduto', { id: produto.id, titulo: produto.titulo });
    return produto;
  } catch (error) {
    logger.error('Airtable criarProduto erro', { message: error.message, stack: error.stack, dados });
    throw error;
  }
}

async function buscarProdutoPorId(id) {
  try {
    const record = await tabelaProdutos.find(id);
    return mapearProduto(record);
  } catch (error) {
    if (error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

async function atualizarProduto(id, dados) {
  try {
    const campos = montarCampos(dados);
    const [record] = await tabelaProdutos.update([{ id, fields: campos }]);
    const produto = mapearProduto(record);
    logger.info('Airtable atualizarProduto', { id: produto.id });
    return produto;
  } catch (error) {
    logger.error('Airtable atualizarProduto erro', { message: error.message, stack: error.stack, id, dados });
    throw error;
  }
}

async function deletarProduto(id) {
  try {
    await tabelaProdutos.destroy(id);
    logger.info('Airtable deletarProduto', { id });
  } catch (error) {
    logger.error('Airtable deletarProduto erro', { message: error.message, stack: error.stack, id });
    throw error;
  }
}

module.exports = {
  listarProdutos,
  criarProduto,
  buscarProdutoPorId,
  atualizarProduto,
  deletarProduto,
};
