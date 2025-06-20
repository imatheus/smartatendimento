# API Reference - Smart Atendimento Backend

## Visão Geral

Base URL: `http://localhost:8080` (desenvolvimento)

Todas as rotas (exceto autenticação) requerem header de autorização:
```
Authorization: Bearer <jwt_token>
```

## Estrutura de Resposta

### Sucesso
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

### Erro
```json
{
  "success": false,
  "error": "Mensagem de erro",
  "details": { ... }
}
```

## Autenticação

### POST /auth/login
**Arquivo:** `src/controllers/AuthController.ts` → `store()`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": 1,
    "name": "Nome do Usuário",
    "email": "user@example.com",
    "profile": "admin",
    "companyId": 1
  }
}
```

### POST /auth/refresh
**Arquivo:** `src/controllers/AuthController.ts` → `update()`

**Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

### POST /auth/logout
**Arquivo:** `src/controllers/AuthController.ts` → `remove()`

## Usuários

### GET /users
**Arquivo:** `src/controllers/UserController.ts` → `index()`

**Query Params:**
- `searchParam` (string): Busca por nome ou email
- `pageNumber` (number): Página (padrão: 1)

**Response:**
```json
{
  "users": [...],
  "count": 10,
  "hasMore": true
}
```

### GET /users/:id
**Arquivo:** `src/controllers/UserController.ts` → `show()`

### POST /users
**Arquivo:** `src/controllers/UserController.ts` → `store()`

**Body:**
```json
{
  "name": "Nome do Usuário",
  "email": "user@example.com",
  "password": "password123",
  "profile": "user",
  "queueIds": [1, 2, 3]
}
```

### PUT /users/:id
**Arquivo:** `src/controllers/UserController.ts` → `update()`

### DELETE /users/:id
**Arquivo:** `src/controllers/UserController.ts` → `remove()`

## Tickets

### GET /tickets
**Arquivo:** `src/controllers/TicketController.ts` → `index()`

**Query Params:**
- `searchParam` (string): Busca
- `pageNumber` (number): Página
- `status` (string): open, pending, closed
- `date` (string): Data no formato YYYY-MM-DD
- `showAll` (boolean): Mostrar todos os tickets
- `userId` (number): Filtrar por usuário
- `queueIds` (array): Filtrar por filas
- `tags` (array): Filtrar por tags
- `users` (array): Filtrar por usuários

**Response:**
```json
{
  "tickets": [...],
  "count": 50,
  "hasMore": true
}
```

### GET /tickets/:id
**Arquivo:** `src/controllers/TicketController.ts` → `show()`

### POST /tickets
**Arquivo:** `src/controllers/TicketController.ts` → `store()`

**Body:**
```json
{
  "contactId": 1,
  "status": "open",
  "userId": 1,
  "queueId": 1
}
```

### PUT /tickets/:id
**Arquivo:** `src/controllers/TicketController.ts` → `update()`

**Body:**
```json
{
  "status": "closed",
  "userId": 2,
  "queueId": 1
}
```

### DELETE /tickets/:id
**Arquivo:** `src/controllers/TicketController.ts` → `remove()`

## Contatos

### GET /contacts
**Arquivo:** `src/controllers/ContactController.ts` → `index()`

**Query Params:**
- `searchParam` (string): Busca por nome ou número
- `pageNumber` (number): Página

### GET /contacts/:id
**Arquivo:** `src/controllers/ContactController.ts` → `show()`

### POST /contacts
**Arquivo:** `src/controllers/ContactController.ts` → `store()`

**Body:**
```json
{
  "name": "Nome do Contato",
  "number": "5511999999999",
  "email": "contato@example.com"
}
```

### PUT /contacts/:id
**Arquivo:** `src/controllers/ContactController.ts` → `update()`

### DELETE /contacts/:id
**Arquivo:** `src/controllers/ContactController.ts` → `remove()`

## WhatsApp

### GET /whatsapp
**Arquivo:** `src/controllers/WhatsAppController.ts` → `index()`

**Response:**
```json
[
  {
    "id": 1,
    "name": "WhatsApp Principal",
    "status": "CONNECTED",
    "qrcode": null,
    "battery": "100",
    "plugged": true
  }
]
```

### GET /whatsapp/:id
**Arquivo:** `src/controllers/WhatsAppController.ts` → `show()`

### POST /whatsapp
**Arquivo:** `src/controllers/WhatsAppController.ts` → `store()`

**Body:**
```json
{
  "name": "WhatsApp Vendas",
  "queueIds": [1, 2],
  "greetingMessage": "Olá! Como posso ajudar?",
  "complationMessage": "Obrigado pelo contato!",
  "outOfHoursMessage": "Estamos fora do horário de atendimento."
}
```

### PUT /whatsapp/:id
**Arquivo:** `src/controllers/WhatsAppController.ts` → `update()`

### DELETE /whatsapp/:id
**Arquivo:** `src/controllers/WhatsAppController.ts` → `remove()`

### POST /whatsapp/:id/start
**Arquivo:** `src/controllers/WhatsAppController.ts` → `startSession()`

### POST /whatsapp/:id/restart
**Arquivo:** `src/controllers/WhatsAppController.ts` → `restartSession()`

## Mensagens

### GET /messages/:ticketId
**Arquivo:** `src/controllers/MessageController.ts` → `index()`

**Query Params:**
- `pageNumber` (number): Página

### POST /messages
**Arquivo:** `src/controllers/MessageController.ts` → `store()`

**Body:**
```json
{
  "ticketId": 1,
  "body": "Mensagem de texto",
  "quotedMsg": {
    "id": "message_id",
    "body": "Mensagem citada"
  }
}
```

### PUT /messages/:id
**Arquivo:** `src/controllers/MessageController.ts` → `update()`

### DELETE /messages/:id
**Arquivo:** `src/controllers/MessageController.ts` → `remove()`

## Filas

### GET /queue
**Arquivo:** `src/controllers/QueueController.ts` → `index()`

### GET /queue/:id
**Arquivo:** `src/controllers/QueueController.ts` → `show()`

### POST /queue
**Arquivo:** `src/controllers/QueueController.ts` → `store()`

**Body:**
```json
{
  "name": "Vendas",
  "color": "#FF5733",
  "greetingMessage": "Bem-vindo ao setor de vendas!"
}
```

### PUT /queue/:id
**Arquivo:** `src/controllers/QueueController.ts` → `update()`

### DELETE /queue/:id
**Arquivo:** `src/controllers/QueueController.ts` → `remove()`

## Campanhas

### GET /campaigns
**Arquivo:** `src/controllers/CampaignController.ts` → `index()`

### GET /campaigns/:id
**Arquivo:** `src/controllers/CampaignController.ts` → `show()`

### POST /campaigns
**Arquivo:** `src/controllers/CampaignController.ts` → `store()`

**Body:**
```json
{
  "name": "Campanha Black Friday",
  "message": "Aproveite nossas ofertas!",
  "contacts": [1, 2, 3],
  "scheduledAt": "2023-11-24T10:00:00Z",
  "whatsappId": 1
}
```

### PUT /campaigns/:id
**Arquivo:** `src/controllers/CampaignController.ts` → `update()`

### DELETE /campaigns/:id
**Arquivo:** `src/controllers/CampaignController.ts` → `remove()`

### POST /campaigns/:id/start
**Arquivo:** `src/controllers/CampaignController.ts` → `start()`

### POST /campaigns/:id/cancel
**Arquivo:** `src/controllers/CampaignController.ts` → `cancel()`

## Agendamentos

### GET /schedules
**Arquivo:** `src/controllers/ScheduleController.ts` → `index()`

### POST /schedules
**Arquivo:** `src/controllers/ScheduleController.ts` → `store()`

**Body:**
```json
{
  "body": "Mensagem agendada",
  "sendAt": "2023-12-25T09:00:00Z",
  "contactId": 1,
  "ticketId": 1
}
```

### PUT /schedules/:id
**Arquivo:** `src/controllers/ScheduleController.ts` → `update()`

### DELETE /schedules/:id
**Arquivo:** `src/controllers/ScheduleController.ts` → `remove()`

## Tags

### GET /tags
**Arquivo:** `src/controllers/TagController.ts` → `index()`

### POST /tags
**Arquivo:** `src/controllers/TagController.ts` → `store()`

**Body:**
```json
{
  "name": "Urgente",
  "color": "#FF0000"
}
```

### PUT /tags/:id
**Arquivo:** `src/controllers/TagController.ts` → `update()`

### DELETE /tags/:id
**Arquivo:** `src/controllers/TagController.ts` → `remove()`

## Relatórios

### GET /reports/dashboard
**Arquivo:** `src/controllers/ReportController.ts` → `dashboard()`

**Query Params:**
- `startDate` (string): Data inicial (YYYY-MM-DD)
- `endDate` (string): Data final (YYYY-MM-DD)
- `userId` (number): Filtrar por usuário
- `queueId` (number): Filtrar por fila

**Response:**
```json
{
  "totalTickets": 150,
  "openTickets": 25,
  "closedTickets": 125,
  "avgResponseTime": "00:05:30",
  "avgResolutionTime": "01:30:45",
  "ticketsByQueue": [...],
  "ticketsByUser": [...],
  "ticketsByHour": [...]
}
```

## Upload de Arquivos

### POST /messages/media
**Arquivo:** `src/controllers/MessageController.ts` → `uploadMedia()`

**Content-Type:** `multipart/form-data`

**Body:**
- `file`: Arquivo (imagem, áudio, documento)
- `ticketId`: ID do ticket

## WebSocket Events

### Eventos Emitidos pelo Servidor:

#### ticket
```json
{
  "action": "update|create|delete",
  "ticket": { ... }
}
```

#### message
```json
{
  "action": "create|update",
  "message": { ... }
}
```

#### contact
```json
{
  "action": "update",
  "contact": { ... }
}
```

#### whatsappSession
```json
{
  "action": "update",
  "session": {
    "id": 1,
    "status": "CONNECTED|DISCONNECTED|PAIRING",
    "qrcode": "base64_qr_code"
  }
}
```

### Eventos Recebidos pelo Servidor:

#### joinChatBox
```json
{
  "ticketId": 1
}
```

#### leaveChatBox
```json
{
  "ticketId": 1
}
```

## Códigos de Status HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## Rate Limiting

- **Limite:** 100 requisições por minuto por IP
- **Header de resposta:** `X-RateLimit-Remaining`
- **Implementação:** `src/middleware/rateLimiter.ts`

## Paginação

Rotas que retornam listas suportam paginação:

**Query Params:**
- `pageNumber`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 20, máximo: 100)

**Response:**
```json
{
  "data": [...],
  "count": 150,
  "hasMore": true,
  "currentPage": 1,
  "totalPages": 8
}
```

## Filtros Avançados

### Tickets
- `status`: open, pending, closed
- `userId`: ID do usuário
- `queueIds`: Array de IDs das filas
- `tags`: Array de IDs das tags
- `dateFrom`: Data inicial (YYYY-MM-DD)
- `dateTo`: Data final (YYYY-MM-DD)

### Contatos
- `searchParam`: Busca por nome ou número
- `hasWhatsapp`: true/false

### Mensagens
- `fromMe`: true/false (mensagens enviadas/recebidas)
- `mediaType`: text, image, audio, video, document