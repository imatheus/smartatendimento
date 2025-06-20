# Smart Atendimento - Documentação Backend

## Visão Geral

Sistema completo de atendimento multi-tenant com integração WhatsApp, desenvolvido em Node.js/TypeScript com Express.js, Sequelize ORM e Socket.IO para comunicação em tempo real.

## 📚 Documentação

### Documentos Principais

- **[Arquitetura](ARCHITECTURE.md)** - Estrutura completa do sistema, camadas e padrões utilizados
- **[Dependências](DEPENDENCIES.md)** - Lista completa de bibliotecas e onde são utilizadas
- **[API Reference](API_REFERENCE.md)** - Documentação completa da API REST
- **[Guia de Desenvolvimento](DEVELOPMENT_GUIDE.md)** - Como desenvolver e contribuir com o projeto
- **[Troubleshooting](TROUBLESHOOTING.md)** - Soluções para problemas comuns

### Interface Web

Abra o arquivo `backend-documentation.html` em seu navegador para uma interface visual da documentação.

## 🚀 Quick Start

### Instalação
```bash
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

### Estrutura Principal
```
backend/
├── src/
│   ├── controllers/     # Controladores das rotas
│   ├── services/       # Lógica de negócio
│   ├── models/         # Modelos Sequelize
│   ├── routes/         # Definição das rotas
│   ├── libs/          # WhatsApp, Socket.IO, Filas
│   └── middleware/    # Middlewares customizados
```

## 🔧 Principais Funcionalidades

### Sistema Multi-Tenant
- **Onde alterar:** `src/models/Company.ts`, `src/middleware/CheckAuth.ts`
- Isolamento completo por empresa
- Planos de assinatura configuráveis

### WhatsApp Integration
- **Onde alterar:** `src/services/WbotServices/`, `src/libs/wbot.ts`
- Múltiplas conexões simultâneas
- Envio de texto, mídia e documentos

### Sistema de Tickets
- **Onde alterar:** `src/services/TicketServices/`, `src/models/Ticket.ts`
- Criação automática de tickets
- Estados: pendente, aberto, fechado

### Chatbot
- **Onde alterar:** `src/services/WbotServices/wbotMessageListener.ts`
- Opções automáticas configuráveis
- Fluxo de conversação inteligente

### Campanhas
- **Onde alterar:** `src/services/CampaignServices/`, `src/jobs/`
- Envio em massa com agendamento
- Processamento em filas assíncronas

## ��� Stack Tecnológico

### Core
- **Node.js** + **TypeScript** - Runtime e linguagem
- **Express.js** - Framework web
- **Sequelize** - ORM para banco de dados

### Integrações
- **@whiskeysockets/baileys** - WhatsApp Web API
- **Socket.IO** - Comunicação em tempo real
- **Bull** + **Redis** - Sistema de filas
- **JWT** - Autenticação

### Banco de Dados
- **PostgreSQL**
- Migrations e seeders automatizados

## 🛠️ Onde Alterar Funcionalidades

| Funcionalidade | Arquivos Principais |
|---|---|
| **Autenticação** | `src/controllers/AuthController.ts`<br>`src/middleware/CheckAuth.ts` |
| **Tickets** | `src/services/TicketServices/`<br>`src/models/Ticket.ts` |
| **WhatsApp** | `src/libs/wbot.ts`<br>`src/services/WbotServices/` |
| **Mensagens** | `src/services/MessageServices/`<br>`src/controllers/MessageController.ts` |
| **Filas** | `src/libs/Queue.ts`<br>`src/jobs/` |
| **WebSocket** | `src/libs/socket.ts`<br>`src/helpers/` |
| **Campanhas** | `src/services/CampaignServices/`<br>`src/jobs/SendCampaign.ts` |
| **Multi-Tenant** | `src/models/Company.ts`<br>`src/middleware/CheckAuth.ts` |

## 🔍 Principais Endpoints

### Autenticação
- `POST /auth/login` - Login do usuário
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Logout

### Tickets
- `GET /tickets` - Listar tickets
- `POST /tickets` - Criar ticket
- `PUT /tickets/:id` - Atualizar ticket

### WhatsApp
- `GET /whatsapp` - Listar conexões
- `POST /whatsapp/:id/start` - Iniciar sessão
- `POST /messages` - Enviar mensagem

## 🚨 Problemas Comuns

### WhatsApp não conecta
```bash
# Limpar sessão
rm -rf .wwebjs_auth/
rm -rf .wwebjs_cache/
```

### Banco não conecta
```bash
# Verificar variáveis .env
DB_HOST=localhost
DB_NAME=smartatendimento
DB_USER=root
DB_PASS=password
```

### Redis não funciona
```bash
# Verificar se está rodando
sudo systemctl status redis
sudo systemctl start redis
```

## 📈 Monitoramento

### Logs
- **Pino** para logs estruturados
- **Sentry** para captura de erros
- Logs em `src/utils/logger.ts`

### Performance
- Queries otimizadas com índices
- Cache Redis para dados frequentes
- Paginação em todas as listagens

## 🔐 Segurança

- **JWT** com refresh tokens
- **bcryptjs** para hash de senhas
- **Yup** para validação de dados
- **Rate limiting** com Redis
- **CORS** configurado
- **Helmet** para headers de segurança

## 📞 Suporte

Para problemas específicos, consulte:
1. **[Troubleshooting](TROUBLESHOOTING.md)** - Soluções para problemas comuns
2. **[Development Guide](DEVELOPMENT_GUIDE.md)** - Guia completo de desenvolvimento
3. **[API Reference](API_REFERENCE.md)** - Documentação da API

---

**Desenvolvido com ❤️ para facilitar o atendimento ao cliente**