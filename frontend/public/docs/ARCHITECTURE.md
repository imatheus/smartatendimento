# Arquitetura do Backend - Smart Atendimento

## Visão Geral da Arquitetura

O Smart Atendimento segue uma arquitetura em camadas (Layered Architecture) com separação clara de responsabilidades:

```
┌─────────────────────────────────────────┐
│              API Layer                  │
│         (Routes + Controllers)          │
├─────────────────────────────────────────┤
│             Service Layer               │
│          (Business Logic)               │
├─────────────────────────────────────────┤
│              Data Layer                 │
│        (Models + Database)              │
├─────────────────────────────────────────┤
│           Integration Layer             │
│    (WhatsApp, Socket.IO, Queues)       │
└───���─────────────────────────────────────┘
```

## Estrutura de Diretórios

```
backend/
├── src/
│   ├── app.ts                 # Configuração principal do Express
│   ├── server.ts              # Inicialização do servidor
│   ├── controllers/           # Controladores das rotas
│   │   ├── AuthController.ts
│   │   ├── TicketController.ts
│   │   ├── UserController.ts
│   │   ├── WhatsAppController.ts
│   │   └── ...
│   ├── services/              # Lógica de negócio
│   │   ├── AuthServices/
│   │   ├── TicketServices/
│   │   ├── UserServices/
│   │   ├── WbotServices/      # WhatsApp Bot Services
│   │   └── ...
│   ├── models/                # Modelos Sequelize
│   │   ├── Company.ts
│   │   ├── User.ts
│   │   ├── Ticket.ts
│   │   ├── Contact.ts
│   │   └── ...
│   ├── routes/                # Definição das rotas
│   │   ├── index.ts
│   │   ├── authRoutes.ts
│   │   ├── ticketRoutes.ts
│   │   └── ...
│   ├── middleware/            # Middlewares customizados
│   │   ├── CheckAuth.ts       # Autenticação JWT
│   │   ├── isAuth.ts          # Verificação de autenticação
│   │   └── ...
│   ├── database/              # Configuração do banco
│   │   ├── index.ts           # Conexão Sequelize
│   │   ├── migrations/        # Migrations do banco
│   │   └── seeds/             # Seeds iniciais
│   ├── libs/                  # Bibliotecas customizadas
│   │   ├── wbot.ts            # WhatsApp Bot
│   │   ├── socket.ts          # Socket.IO
│   │   ├── Queue.ts           # Sistema de filas
│   │   └── ...
│   ├── helpers/               # Funções auxiliares
│   │   ├── CheckSettings.ts
│   │   ├── SerializeUser.ts
│   │   └── ...
│   ├── utils/                 # Utilitários
│   │   ├── logger.ts          # Sistema de logs
│   │   └── ...
│   └── jobs/                  # Jobs para filas
│       ├── SendMessage.ts
���       ├── SendCampaign.ts
│       └── ...
├── uploads/                   # Arquivos enviados
├── public/                    # Arquivos estáticos
└── .env                       # Variáveis de ambiente
```

## Camadas da Aplicação

### 1. API Layer (Routes + Controllers)

**Localização:** `src/routes/` e `src/controllers/`

**Responsabilidade:** Receber requisições HTTP, validar dados de entrada e retornar respostas.

**Principais arquivos:**
- `src/routes/index.ts` - Roteador principal
- `src/controllers/TicketController.ts` - Controle de tickets
- `src/controllers/WhatsAppController.ts` - Controle do WhatsApp

### 2. Service Layer (Business Logic)

**Localização:** `src/services/`

**Responsabilidade:** Implementar regras de negócio, orquestrar operações complexas.

**Principais serviços:**
- `src/services/TicketServices/` - Lógica de tickets
- `src/services/WbotServices/` - Lógica do WhatsApp Bot
- `src/services/UserServices/` - Lógica de usuários

### 3. Data Layer (Models + Database)

**Localização:** `src/models/` e `src/database/`

**Responsabilidade:** Definir estrutura de dados e interagir com o banco.

**Principais modelos:**
- `src/models/Ticket.ts` - Modelo de tickets
- `src/models/User.ts` - Modelo de usuários
- `src/models/Company.ts` - Modelo de empresas

### 4. Integration Layer

**Localização:** `src/libs/`

**Responsabilidade:** Integrar com serviços externos e sistemas de terceiros.

**Principais integrações:**
- `src/libs/wbot.ts` - Integração WhatsApp
- `src/libs/socket.ts` - WebSocket
- `src/libs/Queue.ts` - Sistema de filas

## Padrões Arquiteturais Utilizados

### 1. Repository Pattern
Implementado através dos Services, que encapsulam a lógica de acesso aos dados.

### 2. Dependency Injection
Utilizado para injetar dependências nos controllers e services.

### 3. Observer Pattern
Implementado através do Socket.IO para notificações em tempo real.

### 4. Queue Pattern
Utilizado para processamento assíncrono de tarefas pesadas.

## Fluxo de Dados

### Requisição HTTP Típica:
1. **Route** recebe a requisição
2. **Middleware** valida autenticação/autorização
3. **Controller** processa a requisição
4. **Service** executa a lógica de negócio
5. **Model** interage com o banco de dados
6. **Response** é retornada ao cliente

### Mensagem WhatsApp:
1. **Baileys** recebe mensagem do WhatsApp
2. **wbotMessageListener** processa a mensagem
3. **TicketService** cria/atualiza ticket
4. **Socket.IO** notifica frontend em tempo real
5. **Queue** processa tarefas assíncronas se necessário

## Configurações Importantes

### Database Connection
**Arquivo:** `src/database/index.ts`
```typescript
const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
  // ...
});
```

### Server Initialization
**Arquivo:** `src/server.ts`
```typescript
import app from "./app";
import { initIO } from "./libs/socket";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
```

### App Configuration
**Arquivo:** `src/app.ts`
```typescript
import express from "express";
import routes from "./routes";
import "./database";
```

## Onde Alterar Funcionalidades

### Para alterar autenticação:
- **Middleware:** `src/middleware/CheckAuth.ts`
- **Service:** `src/services/AuthServices/`
- **Controller:** `src/controllers/AuthController.ts`

### Para alterar lógica de tickets:
- **Service:** `src/services/TicketServices/`
- **Model:** `src/models/Ticket.ts`
- **Controller:** `src/controllers/TicketController.ts`

### Para alterar integração WhatsApp:
- **Lib:** `src/libs/wbot.ts`
- **Services:** `src/services/WbotServices/`
- **Listener:** `src/services/WbotServices/wbotMessageListener.ts`

### Para alterar sistema de filas:
- **Lib:** `src/libs/Queue.ts`
- **Jobs:** `src/jobs/`
- **Services:** Qualquer service que use filas

### Para alterar WebSocket:
- **Lib:** `src/libs/socket.ts`
- **Helpers:** `src/helpers/` (funções que emitem eventos)