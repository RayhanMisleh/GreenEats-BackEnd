# GreenEats Backend

API RESTful em Node.js + Express integrada ao Airtable para gerenciar produtos do catálogo GreenEats.

## Stack & Scripts
- Node.js (CommonJS)
- Express, CORS, dotenv, Airtable SDK
- Scripts:
  - `npm run dev` → nodemon para desenvolvimento
  - `npm start` → execução em produção

## Estrutura de Pastas
```
src/
  index.js               # entrypoint Express
  routes/produtosRoutes  # rotas de validação + CRUD
  controllers/produtosController
  services/airtableService
  validators/produtoValidator
```

## Variáveis de Ambiente
Definir em `.env`:
```
AIRTABLE_API_KEY=seu_token
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_NAME=Produtos
PORT=3000
```

## Airtable
- Base: `GreenEats`
- Tabela: `Produtos`
- Campos (todos tipo *Single line text* salvo onde indicado):
  1. `Titulo` (*Single line text*)
  2. `Descricao` (*Long text*)
  3. `Preco` (*Number* ou *Currency*, 2 casas)
  4. `Categoria` (*Single select* → `Fruta`, `Legume`, `Verdura`)
  5. `Estoque` (*Number*, opcional)
  6. `DataCriacao` (*Date* ISO com hora)
- O `record.id` é usado como `id` público.

## Execução
1. `npm install`
2. Criar `.env` com credenciais Airtable.
3. `npm run dev`
4. API disponível em `http://localhost:3000`

## Modelo de Produto
```json
{
  "id": "recXXXX",
  "titulo": "Alface Crespa",
  "descricao": "Alface hidropônica",
  "preco": 4.5,
  "categoria": "Verdura",
  "estoque": 50,
  "dataCriacao": "2025-11-27T12:00:00.000Z"
}
```

## Validação (`validarProduto`)
Regras reaproveitadas em todos os fluxos:
- `titulo` obrigatório, mínimo 5 caracteres.
- `descricao`, se presente, precisa ser string.
- `preco` obrigatório, numérico e > 0.
- `categoria` ∈ {`Fruta`, `Legume`, `Verdura`}.
- `estoque`, se presente, número >= 0.

Resposta padrão:
```json
{ "valido": true, "erros": [] }
```

## Endpoints
### 1. POST `/validar-produto`
- Body mínimo:
```json
{
  "titulo": "Banana Prata",
  "descricao": "Banana orgânica",
  "preco": 5.5,
  "categoria": "Fruta",
  "estoque": 30
}
```
- **200** se válido, **400** com `erros[]` se inválido.

### 2. POST `/produtos`
- Reutiliza body acima; `dataCriacao` opcional (será ISO atual se omitido).
- **201** com produto criado.
- **400** para falha de validação.

### 3. GET `/produtos`
- Retorna `[]` com todos os produtos ordenados por `DataCriacao` desc.
- **200** sempre que sucesso.

### 4. GET `/produtos/:id`
- `:id` = `record.id` Airtable.
- **200** com produto encontrado.
- **404** se não existir.

### 5. PUT `/produtos/:id`
- Body pode conter qualquer subconjunto dos campos.
- Backend mescla campos recebidos com o estado atual antes de validar.
- **200** com produto atualizado.
- **400** para validação.
- **404** se id inexistente.

### 6. DELETE `/produtos/:id`
- Remove registro no Airtable.
- **204** sem corpo.
- **404** se id inexistente.

## Erros Comuns
- **400** `{"valido": false, "erros": ["mensagem"]}` para problemas de negócio.
- **404** `{"mensagem": "Produto não encontrado."}`.
- **500** `{"mensagem": "Erro interno no servidor"}` (log detalhado no console).

## Guia para o Frontend
- Consumir sempre `application/json`.
- Para criar/atualizar, manter exatas chaves `titulo`, `descricao`, `preco`, `categoria`, `estoque`.
- Usar `GET /produtos` para render listagens; `dataCriacao` pode alimentar etiquetas "novo".
- Guardar `id` retornado pois ele será usado nas rotas `/:id`.
- Validar no cliente com as mesmas regras para UX rápida, mas confiar na resposta do backend.
