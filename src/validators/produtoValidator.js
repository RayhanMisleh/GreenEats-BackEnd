const categoriasPermitidas = ['Fruta', 'Legume', 'Verdura'];

function validarProduto(dados = {}) {
  const erros = [];
  const titulo = typeof dados.titulo === 'string' ? dados.titulo.trim() : '';
  const descricao = dados.descricao;
  const preco = Number(dados.preco);
  const categoria = dados.categoria;
  const estoque = dados.estoque;

  if (!titulo || titulo.length < 5) {
    erros.push('O título deve ter pelo menos 5 caracteres.');
  }

  if (descricao && typeof descricao !== 'string') {
    erros.push('A descrição deve ser um texto.');
  }

  if (Number.isNaN(preco)) {
    erros.push('O preço deve ser um número.');
  } else if (preco <= 0) {
    erros.push('O preço deve ser maior que zero.');
  }

  if (!categoriasPermitidas.includes(categoria)) {
    erros.push('A categoria deve ser Fruta, Legume ou Verdura.');
  }

  if (estoque !== undefined && (Number.isNaN(Number(estoque)) || Number(estoque) < 0)) {
    erros.push('O estoque deve ser um número maior ou igual a zero.');
  }

  return {
    valido: erros.length === 0,
    erros,
  };
}

module.exports = {
  validarProduto,
  categoriasPermitidas,
};
