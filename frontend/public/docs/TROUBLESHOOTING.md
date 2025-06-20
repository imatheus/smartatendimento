# Troubleshooting - Smart Atendimento Backend

## Problemas Comuns e Soluções

### 1. Problemas de Conexão com Banco de Dados

#### Erro: "Unable to connect to the database"

**Sintomas:**
```
Unable to connect to the database: SequelizeConnectionError
```

**Onde verificar:**
- `src/database/index.ts` - Configuração da conexão
- `.env` - Variáveis de ambiente do banco

**Soluções:**
1. **Verificar variáveis de ambiente:**
```bash
# .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_atendimento_db
DB_USER=postgres
DB_PASS=password
DB_DIALECT=postgres
```

2. **Testar conexão manual:**
```bash
psql -h localhost -U postgres -d smart_atendimento_db
```

3. **Verificar se o serviço está rodando:**
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

#### Erro: "Table doesn't exist"

**Onde verificar:**
- `src/database/migrations/` - Migrations não executadas

**Solução:**
```bash
npm run db:migrate
```

### 2. Problemas com WhatsApp

#### Erro: "WhatsApp session not found"

**Sintomas:**
- QR Code não aparece
- Conexão falha constantemente

**Onde verificar:**
- `src/libs/wbot.ts` - Configuração do bot
- `src/services/WbotServices/StartWhatsAppSession.ts` - Inicialização

**Soluções:**
1. **Limpar sessão:**
```bash
rm -rf .wwebjs_auth/
rm -rf .wwebjs_cache/
```

2. **Verificar dependências do Chrome:**
```bash
# Ubuntu/Debian
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

3. **Configurar Chrome args:**
```typescript
// src/libs/wbot.ts
const puppeteerOptions = {
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu'
  ]
};
```

#### Erro: "Rate limit exceeded"

**Sintomas:**
- Mensagens não são enviadas
- Erro 429 do WhatsApp

**Onde verificar:**
- `src/services/WbotServices/SendWhatsAppMessage.ts` - Controle de rate limit

**Soluções:**
1. **Implementar delay entre mensagens:**
```typescript
// Adicionar delay de 1-3 segundos entre mensagens
await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
```

2. **Usar filas para controlar envio:**
```typescript
// src/jobs/SendMessage.ts
export default {
  key: "SendMessage",
  options: {
    delay: 2000, // 2 segundos de delay
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000
    }
  }
};
```

### 3. Problemas com Sistema de Filas (Bull + Redis)

#### Erro: "Redis connection failed"

**Sintomas:**
```
Error: Redis connection to localhost:6379 failed
```

**Onde verificar:**
- `src/libs/Queue.ts` - Configuração do Bull + Redis
- `.env` - Variáveis do Redis

**Importante:** Bull não funciona sem Redis - são interdependentes

**Soluções:**
1. **Verificar se Redis está rodando:**
```bash
sudo systemctl status redis
sudo systemctl start redis
```

2. **Testar conexão:**
```bash
redis-cli ping
# Deve retornar: PONG
```

3. **Configurar variáveis de ambiente:**
```bash
# .env
IO_REDIS_SERVER=localhost
IO_REDIS_PORT=6379
IO_REDIS_PASSWORD=
```

#### Jobs não são processados

**Onde verificar:**
- `src/libs/Queue.ts` - Configuração das filas Bull
- `src/jobs/` - Implementação dos jobs

**Soluções:**
1. **Verificar se as filas estão sendo processadas:**
```typescript
// src/libs/Queue.ts
queues.forEach(queue => {
  queue.bull.process(queue.handle);
  
  queue.bull.on('failed', (job, err) => {
    console.log('Job failed', queue.key, job.data);
    console.log(err);
  });
});
```

2. **Limpar filas com problema:**
```bash
redis-cli
> FLUSHALL
```

**Nota:** Se Redis falhar, todo o sistema de filas (Bull) para de funcionar

### 4. Problemas de Autenticação

#### Erro: "Token expired"

**Sintomas:**
- Usuário é deslogado constantemente
- Erro 401 em requisições

**Onde verificar:**
- `src/middleware/CheckAuth.ts` - Validação do token
- `src/services/AuthServices/RefreshTokenService.ts` - Refresh token

**Soluções:**
1. **Verificar configuração JWT:**
```bash
# .env
JWT_SECRET=your-very-secure-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

2. **Aumentar tempo de expiração:**
```typescript
// src/services/AuthServices/AuthUserService.ts
const token = jwt.sign(
  { userId: user.id, companyId: user.companyId },
  process.env.JWT_SECRET,
  { expiresIn: "8h" } // Aumentar de 1h para 8h
);
```

#### Erro: "User not found"

**Onde verificar:**
- `src/middleware/isAuth.ts` - Verificação do usuário
- `src/models/User.ts` - Modelo do usuário

**Solução:**
```typescript
// Verificar se usuário ainda existe e está ativo
const user = await User.findOne({
  where: { 
    id: userId,
    deletedAt: null // Se usando soft delete
  }
});
```

### 5. Problemas de Performance

#### Queries lentas

**Sintomas:**
- API responde lentamente
- Timeout em requisições

**Onde verificar:**
- `src/services/` - Services com queries complexas
- Logs do banco de dados

**Soluções:**
1. **Adicionar índices no banco:**
```sql
-- Índices importantes
CREATE INDEX idx_tickets_company_status ON Tickets(companyId, status);
CREATE INDEX idx_messages_ticket ON Messages(ticketId);
CREATE INDEX idx_contacts_company_number ON Contacts(companyId, number);
```

2. **Otimizar queries:**
```typescript
// Usar includes específicos
const tickets = await Ticket.findAll({
  include: [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number"] // Apenas campos necessários
    }
  ],
  attributes: ["id", "status", "updatedAt"], // Apenas campos necessários
  limit: 20
});
```

3. **Implementar paginação:**
```typescript
const { count, rows } = await Ticket.findAndCountAll({
  limit: pageSize,
  offset: (page - 1) * pageSize
});
```

#### Memória alta

**Sintomas:**
- Processo Node.js consome muita RAM
- Server fica lento

**Soluções:**
1. **Limitar resultados de queries:**
```typescript
// Sempre usar limit
const tickets = await Ticket.findAll({
  limit: 100, // Nunca buscar todos os registros
  order: [["updatedAt", "DESC"]]
});
```

2. **Implementar cache:**
```typescript
import redis from "../libs/redis";

const cacheKey = `dashboard:${companyId}`;
let data = await redis.get(cacheKey);

if (!data) {
  data = await generateDashboardData(companyId);
  await redis.setex(cacheKey, 300, JSON.stringify(data)); // 5 min
} else {
  data = JSON.parse(data);
}
```

### 6. Problemas com Socket.IO

#### Eventos não são recebidos

**Sintomas:**
- Frontend não recebe atualizações em tempo real
- Notificações não funcionam

**Onde verificar:**
- `src/libs/socket.ts` - Configuração do Socket.IO
- `src/helpers/` - Emissão de eventos

**Soluções:**
1. **Verificar configuração CORS:**
```typescript
// src/libs/socket.ts
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});
```

2. **Verificar se eventos estão sendo emitidos:**
```typescript
// Adicionar logs para debug
const emitEvent = (event: string, data: any) => {
  console.log(`Emitting event: ${event}`, data);
  io.emit(event, data);
};
```

#### Múltiplas conexões do mesmo usuário

**Solução:**
```typescript
// src/libs/socket.ts
const userSockets = new Map();

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    // Desconectar conexões antigas
    if (userSockets.has(userId)) {
      userSockets.get(userId).disconnect();
    }
    userSockets.set(userId, socket);
  });
});
```

### 7. Problemas de Deploy

#### Erro: "Port already in use"

**Solução:**
```bash
# Encontrar processo usando a porta
sudo lsof -i :8080

# Matar processo
sudo kill -9 <PID>

# Ou usar porta diferente
PORT=8081 npm start
```

#### Erro: "Permission denied"

**Soluções:**
```bash
# Dar permissões corretas
sudo chown -R $USER:$USER /path/to/project
chmod +x node_modules/.bin/*

# Ou rodar com sudo (não recomendado)
sudo npm start
```

### 8. Logs e Debugging

#### Habilitar logs detalhados

```bash
# .env
NODE_ENV=development
LOG_LEVEL=debug
```

```typescript
// src/utils/logger.ts
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  prettyPrint: process.env.NODE_ENV === "development"
});

export default logger;
```

#### Monitorar logs em tempo real

```bash
# PM2
pm2 logs smartatendimento-backend --lines 100

# Docker
docker logs -f container-name

# Arquivo de log
tail -f logs/app.log
```

### 9. Comandos Úteis para Diagnóstico

```bash
# Verificar status dos serviços
sudo systemctl status postgresql redis nginx

# Verificar portas em uso
sudo netstat -tulpn | grep :8080

# Verificar uso de memória
free -h
top -p $(pgrep node)

# Verificar espaço em disco
df -h

# Verificar logs do sistema
sudo journalctl -u postgresql -f
sudo journalctl -u redis -f

# Testar conectividade
ping google.com
telnet localhost 3306
telnet localhost 6379

# Verificar variáveis de ambiente
printenv | grep DB_
printenv | grep JWT_
```

### 10. Contatos para Suporte

**Problemas de Infraestrutura:**
- Verificar logs em `/var/log/`
- Contatar administrador do sistema

**Problemas de Código:**
- Verificar issues no repositório
- Consultar documentação da API
- Revisar logs da aplicação

**Problemas de Integração:**
- Verificar status das APIs externas
- Consultar documentação do WhatsApp Business API
- Verificar limites de rate limiting