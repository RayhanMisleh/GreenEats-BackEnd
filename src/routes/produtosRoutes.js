const express = require('express');
const produtosController = require('../controllers/produtosController');

const router = express.Router();

router.post('/validar-produto', produtosController.validarProdutoHandler);
router.post('/produtos', produtosController.criarProduto);
router.get('/produtos', produtosController.listarProdutos);
router.get('/produtos/:id', produtosController.buscarProdutoPorId);
router.put('/produtos/:id', produtosController.atualizarProduto);
router.delete('/produtos/:id', produtosController.deletarProduto);

module.exports = router;
