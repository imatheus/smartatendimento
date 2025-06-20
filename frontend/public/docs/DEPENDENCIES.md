# Dependências do Backend - Smart Atendimento

## Dependências de Produção

### Core Framework
```json
{
  "express": "^4.18.2",
  "@types/express": "^4.17.17"
}
```
**Uso:** Framework web principal para criação da API REST
**Onde é usado:** `src/app.ts`, todos os controllers e routes

### TypeScript
```json
{
  "typescript": "^5.0.4",
  "ts-node": "^10.9.1",
  "ts-node-dev": "^2.0.0"
}
```
**Uso:** Linguagem principal do projeto
**Onde é usado:** Todo o projeto

### Database & ORM
```json
{
  "sequelize": "^6.32.1",
  "sequelize-typescript": "^2.1.5",
  "pg": "^8.11.3"
}
```
**Uso:** ORM para interação com banco de dados PostgreSQL
**Onde é usado:** 
- `src/database/index.ts` - Configuração
- `src/models/` - Definição dos modelos
- Todos os services que fazem consultas

### Authentication & Security
```json
{
  "jsonwebtoken": "^9.0.2",
  "@types/jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "@types/bcryptjs": "^2.4.2"
}
```
**Uso:** Autenticação JWT e criptografia de senhas
**Onde é usado:**
- `src/middleware/CheckAuth.ts`
- `src/services/AuthServices/`
- `src/controllers/AuthController.ts`

### Validation
```json
{
  "yup": "^1.2.0"
}
```
**Uso:** Validação de dados de entrada
**Onde é usado:** Todos os controllers para validar request body

### WhatsApp Integration
```json
{
  "@whiskeysockets/baileys": "^6.4.0"
}
```
**Uso:** Biblioteca principal para integração com WhatsApp Web
**Onde é usado:**
- `src/libs/wbot.ts`
- `src/services/WbotServices/`
- `src/controllers/WhatsAppController.ts`

### WebSocket
```json
{
  "socket.io": "^4.7.2",
  "@types/socket.io": "^3.0.2"
}
```
**Uso:** Comunicação em tempo real com o frontend
**Onde é usado:**
- `src/libs/socket.ts`
- `src/helpers/` (emissão de eventos)
- `src/services/` (notificações)

### Queue System (Bull + Redis)
```json
{
  "bull": "^4.11.3",
  "@types/bull": "^4.10.0",
  "redis": "^4.6.7",
  "@types/redis": "^4.0.11"
}
```
**Uso:** Sistema de filas para processamento assíncrono (Bull requer Redis como backend)
**Onde é usado:**
- `src/libs/Queue.ts`
- `src/jobs/`
- `src/services/CampaignServices/`
**Dependência:** Bull não funciona sem Redis - são interdependentes

### File Upload
```json
{
  "multer": "^1.4.5-lts.1",
  "@types/multer": "^1.4.7"
}
```
**Uso:** Upload de arquivos (imagens, documentos, áudios)
**Onde é usado:**
- `src/routes/` (middlewares de upload)
- `src/controllers/` (processamento de arquivos)

### Logging
```json
{
  "pino": "^8.14.1",
  "pino-pretty": "^10.0.1"
}
```
**Uso:** Sistema de logs estruturados
**Onde é usado:**
- `src/utils/logger.ts`
- Todo o projeto para logging

### Error Monitoring
```json
{
  "@sentry/node": "^7.57.0"
}
```
**Uso:** Monitoramento e captura de erros em produção
**Onde é usado:**
- `src/app.ts` (configuração)
- Middleware de error handling

### HTTP Client
```json
{
  "axios": "^1.4.0"
}
```
**Uso:** Requisições HTTP para APIs externas
**Onde é usado:**
- `src/services/` (integrações externas)
- Webhooks e APIs de terceiros

### Utilities
```json
{
  "date-fns": "^2.30.0",
  "uuid": "^9.0.0",
  "@types/uuid": "^9.0.2",
  "mime-types": "^2.1.35",
  "@types/mime-types": "^2.1.1"
}
```
**Uso:** Utilitários para datas, UUIDs e tipos MIME
**Onde é usado:**
- `src/helpers/`
- `src/utils/`
- Services diversos

### CORS & Security
```json
{
  "cors": "^2.8.5",
  "@types/cors": "^2.8.13",
  "helmet": "^7.0.0"
}
```
**Uso:** Configuração de CORS e headers de segurança
**Onde é usado:** `src/app.ts`

### Environment & Config
```json
{
  "dotenv": "^16.3.1"
}
```
**Uso:** Carregamento de variáveis de ambiente
**Onde é usado:** `src/app.ts`, `src/database/index.ts`

## Dependências de Desenvolvimento

### Testing
```json
{
  "jest": "^29.6.1",
  "@types/jest": "^29.5.3",
  "supertest": "^6.3.3",
  "@types/supertest": "^2.0.12"
}
```
**Uso:** Framework de testes
**Onde é usado:** `__tests__/`

### Code Quality
```json
{
  "eslint": "^8.45.0",
  "@typescript-eslint/eslint-plugin": "^6.2.0",
  "@typescript-eslint/parser": "^6.2.0",
  "prettier": "^3.0.0"
}
```
**Uso:** Linting e formatação de código
**Onde é usado:** Todo o projeto

### Build Tools
```json
{
  "nodemon": "^3.0.1",
  "concurrently": "^8.2.0"
}
```
**Uso:** Desenvolvimento e build
**Onde é usado:** Scripts do package.json

## Mapeamento de Dependências por Funcionalidade

### Sistema Multi-Tenant
- **sequelize** - Modelos e queries
- **jsonwebtoken** - Autenticação por empresa
- **yup** - Validação de dados da empresa

### WhatsApp Integration
- **@whiskeysockets/baileys** - Conexão WhatsApp
- **socket.io** - Notificações em tempo real
- **multer** - Upload de mídias
- **mime-types** - Detecção de tipos de arquivo

### Sistema de Tickets
- **sequelize** - Persistência de dados
- **socket.io** - Atualizações em tempo real
- **date-fns** - Manipulação de datas
- **uuid** - IDs únicos

### Sistema de Filas
- **bull + redis** - Sistema de filas completo (Bull usa Redis como backend)
- **pino** - Logs de jobs

### API REST
- **express** - Framework web
- **cors** - Configuração CORS
- **helmet** - Headers de segurança
- **yup** - Validação de entrada

### Monitoramento
- **pino** - Logs estruturados
- **@sentry/node** - Captura de erros
- **axios** - Webhooks de monitoramento

## Scripts do Package.json

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node-dev --respawn --transpile-only --ignore node_modules src/server.ts",
    "db:migrate": "npx sequelize-cli db:migrate",
    "db:migrate:undo": "npx sequelize-cli db:migrate:undo",
    "db:seed": "npx sequelize-cli db:seed:all",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts"
  }
}
```

## Onde Alterar Dependências

### Para adicionar nova dependência:
1. `npm install <package>` ou `npm install -D <package>`
2. Atualizar este documento
3. Importar nos arquivos necessários

### Para atualizar dependências:
1. `npm update` ou `npm update <package>`
2. Testar funcionalidades afetadas
3. Atualizar documentação se necessário

### Para remover dependências:
1. `npm uninstall <package>`
2. Remover imports dos arquivos
3. Atualizar documentação

## Dependências Críticas (Não Remover)

- **express** - Core do servidor
- **sequelize** - ORM principal
- **@whiskeysockets/baileys** - WhatsApp (funcionalidade principal)
- **socket.io** - Tempo real (essencial)
- **jsonwebtoken** - Autenticação (segurança)
- **bull + redis** - Sistema de filas (performance crítica - interdependentes)