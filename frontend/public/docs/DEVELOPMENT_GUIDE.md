# Guia de Desenvolvimento - Smart Atendimento Backend

## Configuração do Ambiente

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL
- Redis (requerido para Bull - sistema de filas)
- Git

### Instalação

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd smartatendimento/backend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

4. **Configure o banco de dados:**
```bash
npm run db:migrate
npm run db:seed
```

5. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

## Estrutura de Desenvolvimento

### Fluxo de Desenvolvimento

1. **Criar nova funcionalidade:**
   - Criar migration (se necessário)
   - Criar/atualizar model
   - Criar service
   - Criar controller
   - Criar route
   - Adicionar testes

2. **Modificar funcionalidade existente:**
   - Identificar arquivos afetados
   - Fazer alterações
   - Atualizar testes
   - Testar integração

### Convenções de Código

#### Nomenclatura
- **Arquivos:** PascalCase para classes, camelCase para funções
- **Variáveis:** camelCase
- **Constantes:** UPPER_SNAKE_CASE
- **Interfaces:** Prefixo `I` (ex: `IUser`)

#### Estrutura de Arquivos
```typescript
// Controller Example
import { Request, Response } from "express";
import * as Yup from "yup";

import CreateUserService from "../services/UserServices/CreateUserService";
import ShowUserService from "../services/UserServices/ShowUserService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  // Validation
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    email: Yup.string().email().required(),
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  // Service call
  const user = await CreateUserService(req.body);

  return res.status(201).json(user);
};
```

## Onde Alterar Funcionalidades

### 1. Sistema de Autenticação

**Para alterar login/logout:**
- **Controller:** `src/controllers/AuthController.ts`
- **Service:** `src/services/AuthServices/AuthUserService.ts`
- **Middleware:** `src/middleware/CheckAuth.ts`

**Para alterar validação JWT:**
- **Middleware:** `src/middleware/isAuth.ts`
- **Helper:** `src/helpers/CheckAuth.ts`

### 2. Sistema de Tickets

**Para alterar criação de tickets:**
- **Service:** `src/services/TicketServices/CreateTicketService.ts`
- **Model:** `src/models/Ticket.ts`
- **Controller:** `src/controllers/TicketController.ts`

**Para alterar status de tickets:**
- **Service:** `src/services/TicketServices/UpdateTicketService.ts`
- **WebSocket:** Emissão em `src/helpers/` 

**Para alterar atribuição automática:**
- **Service:** `src/services/TicketServices/FindOrCreateTicketService.ts`
- **Helper:** `src/helpers/GetDefaultWhatsApp.ts`

### 3. Integração WhatsApp

**Para alterar conexão WhatsApp:**
- **Lib:** `src/libs/wbot.ts`
- **Service:** `src/services/WbotServices/StartWhatsAppSession.ts`

**Para alterar processamento de mensagens:**
- **Listener:** `src/services/WbotServices/wbotMessageListener.ts`
- **Service:** `src/services/MessageServices/CreateMessageService.ts`

**Para alterar envio de mensagens:**
- **Service:** `src/services/WbotServices/SendWhatsAppMessage.ts`
- **Service:** `src/services/WbotServices/SendWhatsAppMedia.ts`

### 4. Sistema de Filas (Bull + Redis)

**Para alterar processamento de jobs:**
- **Lib:** `src/libs/Queue.ts` (Bull usa Redis como backend)
- **Jobs:** `src/jobs/SendMessage.ts`, `src/jobs/SendCampaign.ts`

**Para adicionar novo job:**
1. Criar arquivo em `src/jobs/NewJob.ts`
2. Registrar em `src/libs/Queue.ts`
3. Usar nos services necessários

**Importante:** Bull não funciona sem Redis - são interdependentes

### 5. Sistema Multi-Tenant

**Para alterar isolamento por empresa:**
- **Middleware:** `src/middleware/CheckAuth.ts`
- **Helper:** `src/helpers/CheckSettings.ts`
- **Models:** Adicionar `companyId` em todos os modelos

**Para alterar planos/limites:**
- **Model:** `src/models/Company.ts`
- **Service:** `src/services/CompanyServices/`

### 6. WebSocket (Tempo Real)

**Para alterar eventos emitidos:**
- **Lib:** `src/libs/socket.ts`
- **Helpers:** `src/helpers/` (funções que emitem eventos)

**Para adicionar novo evento:**
1. Definir em `src/libs/socket.ts`
2. Emitir nos services apropriados
3. Documentar no frontend

### 7. Sistema de Campanhas

**Para alterar envio de campanhas:**
- **Service:** `src/services/CampaignServices/StartCampaignService.ts`
- **Job:** `src/jobs/SendCampaign.ts`

**Para alterar agendamento:**
- **Service:** `src/services/ScheduleServices/`
- **Job:** `src/jobs/SendScheduledMessage.ts`

## Adicionando Novas Funcionalidades

### 1. Novo Endpoint

1. **Criar Service:**
```typescript
// src/services/ExampleServices/CreateExampleService.ts
import Example from "../../models/Example";

interface Request {
  name: string;
  description: string;
  companyId: number;
}

const CreateExampleService = async ({ name, description, companyId }: Request): Promise<Example> => {
  const example = await Example.create({
    name,
    description,
    companyId
  });

  return example;
};

export default CreateExampleService;
```

2. **Criar Controller:**
```typescript
// src/controllers/ExampleController.ts
import { Request, Response } from "express";
import * as Yup from "yup";

import CreateExampleService from "../services/ExampleServices/CreateExampleService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    description: Yup.string().required()
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const example = await CreateExampleService({
    ...req.body,
    companyId
  });

  return res.status(201).json(example);
};
```

3. **Criar Route:**
```typescript
// src/routes/exampleRoutes.ts
import express from "express";
import isAuth from "../middleware/isAuth";
import * as ExampleController from "../controllers/ExampleController";

const exampleRoutes = express.Router();

exampleRoutes.post("/examples", isAuth, ExampleController.store);

export default exampleRoutes;
```

4. **Registrar Route:**
```typescript
// src/routes/index.ts
import exampleRoutes from "./exampleRoutes";

routes.use(exampleRoutes);
```

### 2. Novo Model

```typescript
// src/models/Example.ts
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";

import Company from "./Company";

@Table
class Example extends Model<Example> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  description: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Example;
```

### 3. Nova Migration

```bash
npx sequelize-cli migration:generate --name create-example
```

```typescript
// src/database/migrations/xxxx-create-example.js
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Examples", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      companyId: {
        type: Sequelize.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable("Examples");
  }
};
```

## Debugging

### Logs
```typescript
import logger from "../utils/logger";

logger.info("Informação importante");
logger.error("Erro ocorrido", { error: err });
logger.debug("Debug info", { data });
```

### Debug no VS Code
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "program": "${workspaceFolder}/backend/src/server.ts",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

## Testes

### Estrutura de Testes
```typescript
// __tests__/unit/services/CreateUserService.spec.ts
import CreateUserService from "../../../src/services/UserServices/CreateUserService";

describe("CreateUserService", () => {
  it("should create a user", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "123456",
      companyId: 1
    };

    const user = await CreateUserService(userData);

    expect(user).toHaveProperty("id");
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
  });
});
```

### Executar Testes
```bash
npm test                 # Todos os testes
npm run test:watch      # Watch mode
npm test -- --coverage # Com coverage
```

## Performance

### Otimizações de Query
```typescript
// Incluir relacionamentos necessários
const tickets = await Ticket.findAll({
  include: [
    { model: Contact, as: "contact" },
    { model: User, as: "user" },
    { model: Queue, as: "queue" }
  ],
  where: { companyId },
  limit: 20,
  offset: (pageNumber - 1) * 20
});
```

### Cache com Redis
```typescript
import redis from "../libs/redis";

const cacheKey = `tickets:${companyId}:${pageNumber}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const tickets = await getTickets();
await redis.setex(cacheKey, 300, JSON.stringify(tickets)); // 5 min cache
```

## Monitoramento

### Logs Estruturados
```typescript
logger.info("User created", {
  userId: user.id,
  companyId: user.companyId,
  action: "user_created"
});
```

### Métricas
```typescript
// Tempo de resposta
const startTime = Date.now();
// ... operação
const duration = Date.now() - startTime;
logger.info("Operation completed", { duration, operation: "create_ticket" });
```

## Deploy

### Build
```bash
npm run build
```

### Variáveis de Produção
```bash
NODE_ENV=production
DB_HOST=production-db-host
REDIS_URL=redis://production-redis
SENTRY_DSN=your-sentry-dsn
```

### PM2 (Produção)
```bash
npm install -g pm2
pm2 start dist/server.js --name "smartatendimento-backend"
pm2 startup
pm2 save
```