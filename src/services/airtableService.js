const Airtable = require('airtable');
require('dotenv').config();

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
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
  if (dados.dataCriacao !== undefined) campos.DataCriacao = dados.dataCriacao;

  return campos;
}

async function listarProdutos() {
  const records = await tabelaProdutos.select({
    sort: [{ field: 'DataCriacao', direction: 'desc' }],
  }).all();

  return records.map(mapearProduto);
}

async function criarProduto(dados) {
  const campos = montarCampos({
    ...dados,
    dataCriacao: dados.dataCriacao || new Date().toISOString(),
  });

  const [record] = await tabelaProdutos.create([{ fields: campos }]);
  return mapearProduto(record);
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
  const campos = montarCampos(dados);
  const [record] = await tabelaProdutos.update([{ id, fields: campos }]);
  return mapearProduto(record);
}

async function deletarProduto(id) {
  await tabelaProdutos.destroy(id);
}

module.exports = {
  listarProdutos,
  criarProduto,
  buscarProdutoPorId,
  atualizarProduto,
  deletarProduto,
};
