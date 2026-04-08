# API - Gerenciamento de Ficha D&D 5e

API RESTful para gerenciamento de fichas de personagens de **Dungeons & Dragons 5ª Edição**, desenvolvida como Trabalho I da disciplina de Serviços Web — IFSul Campus Passo Fundo.

---

## Domínio / Cenário

A aplicação modela o contexto de um sistema de fichas digitais de RPG. Jogadores podem criar contas, autenticar-se e gerenciar seus personagens de D&D 5e, com cálculos automáticos de modificadores, bônus de proficiência e percepção passiva baseados nas regras oficiais da 5ª edição.

**Recursos modelados:**
- `User` — conta do jogador (autenticação e posse dos personagens)
- `Character` — ficha completa do personagem, vinculada ao usuário

---

## Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Runtime | Node.js 20+ | Amplamente adotado, excelente ecossistema para APIs |
| Framework HTTP | Express 4 | Minimalista, flexível, estudado em aula |
| Banco de dados | PostgreSQL | Relacional, robusto, suporte a integridade referencial |
| ORM | Prisma 5 | Type-safe, migrations automáticas, developer experience superior |
| Autenticação | JWT (jsonwebtoken) | Stateless, compatível com REST |
| Hash de senha | bcryptjs | Padrão da indústria para armazenamento seguro |
| Documentação | OpenAPI 3.0 + Swagger UI | Contrato público da API, testes integrados |

---

## Estrutura do Projeto

```
dnd-api/
├── src/
│   ├── server.js              # Entry point
│   ├── app.js                 # Configuração do Express
│   ├── routes/
│   │   ├── auth.routes.js     # POST /auth/register, /login, GET /auth/me
│   │   └── character.routes.js # CRUD /characters
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── character.controller.js
│   ├── services/
│   │   ├── auth.service.js    # Lógica de registro/login, geração de JWT
│   │   └── character.service.js # Regras D&D, validação, campos calculados
│   ├── dao/
│   │   ├── user.dao.js        # Acesso ao banco — tabela User
│   │   └── character.dao.js   # Acesso ao banco — tabela Character
│   ├── middlewares/
│   │   ├── auth.js            # Validação do JWT
│   │   └── errorHandler.js    # Tratamento centralizado de erros
│   └── config/
│       └── prisma.js          # Cliente Prisma singleton
├── prisma/
│   ├── schema.prisma          # Modelos do banco de dados
│   └── seed.js                # Dados de exemplo
├── docs/
│   └── openapi.yaml           # Especificação OpenAPI 3.0
├── .env.example
└── package.json
```

---

## Instalação e Execução

### Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente (ou via Docker)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/dnd-api.git
cd dnd-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com sua string de conexão do PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:senha@localhost:5432/dndapi"
JWT_SECRET="seu-segredo-aqui"
PORT=3000
```

### 4. Crie o banco e rode as migrations

```bash
npx prisma migrate dev --name init
```

### 5. (Opcional) Popule com dados de exemplo

```bash
node prisma/seed.js
```

Isso cria dois usuários com personagens prontos:
- `aragorn@lotr.com` / `senha123` — 2 personagens
- `legolas@mirkwood.com` / `senha123` — 1 personagem

### 6. Inicie o servidor

```bash
# Produção
npm start

# Desenvolvimento (com hot reload)
npm run dev
```

O servidor sobe em **http://localhost:3000**

---

## Documentação da API

Acesse o **Swagger UI** em:

```
http://localhost:3000/api-docs
```

A documentação é interativa, permitindo autenticar e testar todos os endpoints diretamente pelo browser.

---

## Tabela de Rotas

### Autenticação

| Método | Rota | Descrição | Auth | Status Sucesso | Status Erro |
|---|---|---|---|---|---|
| `POST` | `/auth/register` | Cria nova conta | Desnecessário | 201 | 400, 409 |
| `POST` | `/auth/login` | Login, retorna JWT | Desnecessário | 200 | 400, 401 |
| `GET` | `/auth/me` | Dados do usuário logado | Necessário | 200 | 401 |

### Personagens

| Método | Rota | Descrição | Auth | Status Sucesso | Status Erro |
|---|---|---|---|---|---|
| `GET` | `/characters` | Lista personagens do usuário | Necessário | 200 | 401 |
| `POST` | `/characters` | Cria novo personagem | Necessário | 201 | 400, 401 |
| `GET` | `/characters/options` | Raças, classes e alinhamentos | Necessário | 200 | 401 |
| `GET` | `/characters/:id` | Ficha completa com campos calculados | Necessário | 200 | 401, 403, 404 |
| `PUT` | `/characters/:id` | Atualiza personagem completo | Necessário | 200 | 400, 401, 403, 404 |
| `PATCH` | `/characters/:id` | Atualização parcial (ex: HP em combate) | Necessário | 200 | 400, 401, 403, 404 |
| `DELETE` | `/characters/:id` | Remove personagem | Necessário | 204 | 401, 403, 404 |

### Utilitários

| Método | Rota | Descrição | Auth | Status |
|---|---|---|---|---|
| `GET` | `/health` | Health check | Desnecessário | 200 |
| `GET` | `/api-docs` | Swagger UI | Desnecessário | 200 |

---

## Autenticação JWT

O fluxo de autenticação é *stateless*:

1. **Registro:** `POST /auth/register` → retorna token imediatamente
2. **Login:** `POST /auth/login` → retorna token válido por 7 dias
3. **Uso:** inclua o token em toda requisição protegida:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```

Rotas protegidas retornam `401` sem token ou com token inválido/expirado, e `403` quando o recurso existe mas pertence a outro usuário.

---

## Campos Calculados (D&D 5e)

Ao consultar `GET /characters/:id`, a API retorna o objeto `computed` com valores derivados das regras oficiais:

```json
"computed": {
  "strengthModifier": 4,
  "dexterityModifier": 3,
  "constitutionModifier": 2,
  "intelligenceModifier": 1,
  "wisdomModifier": 2,
  "charismaModifier": 1,
  "proficiencyBonus": 4,
  "passivePerception": 12,
  "isAlive": true
}
```

**Fórmulas aplicadas:**
- `modifier = floor((score - 10) / 2)`
- `proficiencyBonus = ceil(level / 4) + 1`
- `passivePerception = 10 + wisdomModifier`

---

## Exemplos de Teste com curl

### Registrar usuário
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Gandalf","email":"gandalf@istari.com","password":"youshallnotpass"}'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aragorn@lotr.com","password":"senha123"}'
```

### Criar personagem (com token)
```bash
curl -X POST http://localhost:3000/characters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Gandalf, o Cinzento",
    "race": "Human",
    "class": "Wizard",
    "subclass": "School of Evocation",
    "background": "Hermit",
    "alignment": "Neutral Good",
    "level": 20,
    "strength": 10,
    "dexterity": 14,
    "constitution": 16,
    "intelligence": 20,
    "wisdom": 18,
    "charisma": 16,
    "maxHitPoints": 136,
    "armorClass": 12
  }'
```

### Atualizar HP em combate (PATCH)
```bash
curl -X PATCH http://localhost:3000/characters/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"currentHitPoints": 45, "temporaryHitPoints": 10}'
```

### Deletar personagem
```bash
curl -X DELETE http://localhost:3000/characters/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Os mesmos testes foram realizados via Postman, também retornando sucesso (quando executado corretamente, respeitando as restrições de autenticação).

---

## Pesquisa e Contextualização Tecnológica

### Javascript/Node.js + Express
O Express é um framework minimalista e flexível para Node.js, amplamente utilizado para construir APIs. Por não impor uma estrutura rígida ou ferramentas específicas (como banco de dados e autenticação), ele permite total controle arquitetural, sendo ideal para o aprendizado prático. Este framework foi escolhido por sua maturidade, farta documentação e por ter sido previamente estudado.

### PostgreSQL + Prisma ORM
O PostgreSQL é o banco relacional open-source mais avançado em uso atual, com suporte a JSON, arrays, full-text search e extensões como PostGIS. O Prisma se diferencia de ORMs tradicionais como Sequelize e TypeORM por gerar um cliente fortemente tipado a partir do schema, capturando erros em tempo de desenvolvimento. A abstração do Prisma mantém a camada DAO limpa e independente do banco subjacente — substituir PostgreSQL por SQLite para testes, por exemplo, requer apenas trocar a string de conexão.

### JWT (JSON Web Tokens)
A autenticação JWT mantém a API stateless: o servidor não armazena sessões, e o token carrega as informações necessárias (userId, email) assinadas com segredo. Isso é fundamental para a restrição REST de *statelessness* descrita por Fielding. A alternativa com estado (sessions + Redis) oferece revogação imediata de tokens — uma limitação do JWT puro que pode ser mitigada com tokens de curta duração ou blacklists.

### OpenAPI 3.0 / Swagger
A especificação OpenAPI permite que a documentação seja o contrato da API — não apenas documentação post-hoc. Ferramentas como o Swagger UI geram interfaces de teste interativas, e geradores de código podem criar SDKs de cliente automaticamente a partir do `.yaml`. O arquivo `openapi.yaml` neste projeto serve como fonte da verdade sobre rotas, parâmetros e esquemas de resposta.

---

## Autor

Aluno: Pedro Pizzolato Mello
Desenvolvido para a disciplina Serviços Web (PF_CC.44)  
IFSul — Campus Passo Fundo  
Professor: Élder F. F. Bernardi
