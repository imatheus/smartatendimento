# Implementação Completa - Sistema de Acesso Limitado para Empresas Vencidas

## Resumo das Alterações

### Backend

#### 1. Middleware de Autenticação
- ✅ **Criado**: `middleware/isAuthWithExpiredAccess.ts`
  - Permite login de empresas vencidas
  - Restringe acesso apenas às rotas do financeiro
  - Retorna erro 402 para rotas não permitidas

#### 2. Serviços de Sincronização
- ✅ **Criado**: `services/CompanyService/SyncCompanyDueDateService.ts`
  - Sincroniza data de vencimento entre painel, Asaas e período de trial
  - Calcula automaticamente período de avaliação (7 dias antes do vencimento)
  - Cria/atualiza assinaturas no Asaas

#### 3. Webhook do Asaas
- ✅ **Atualizado**: `services/AsaasService/ProcessAsaasWebhookService.ts`
  - Processa pagamentos confirmados
  - Atualiza automaticamente data de vencimento (+1 mês)
  - Notifica frontend via Socket.IO

#### 4. Autenticação de Usuários
- ✅ **Atualizado**: `services/UserServices/AuthUserService.ts`
  - Remove bloqueio de empresas vencidas no login
  - Inclui informações de status da empresa na resposta
  - Calcula `isInTrial`, `isExpired` dinamicamente

- ✅ **Atualizado**: `services/AuthServices/RefreshTokenService.ts`
  - Inclui status da empresa no refresh token
  - Mantém informações atualizadas

#### 5. Tipos e Interfaces
- ✅ **Atualizado**: `@types/express.d.ts`
  - Adiciona propriedades da empresa ao Request
- ✅ **Atualizado**: `helpers/SerializeUser.ts`
  - Suporte para novos campos da empresa

#### 6. Rotas Atualizadas
- ✅ `routes/companyRoutes.ts` - Usa novo middleware
- ✅ `routes/invoicesRoutes.ts` - Usa novo middleware  
- ✅ `routes/userRoutes.ts` - Usa novo middleware

### Frontend

#### 1. Hook de Autenticação
- ✅ **Atualizado**: `hooks/useAuth.js/index.js`
  - Remove bloqueio no login
  - Redireciona empresas vencidas para `/financeiro`
  - Adiciona interceptor para erro 402
  - Mostra mensagens apropriadas por status

#### 2. Guarda de Rotas
- ✅ **Atualizado**: `components/TrialGuard/index.js`
  - Atualiza lógica para trabalhar com novos status
  - Redireciona empresas vencidas para financeiro
  - Usa `isExpired` e `isInTrial` do backend

## Fluxo de Funcionamento

### 1. Login de Empresa Vencida
```
1. Usuário faz login
2. Backend autentica sem bloquear
3. Frontend recebe status da empresa
4. Se vencida: redireciona para /financeiro
5. Mostra mensagem explicativa
```

### 2. Tentativa de Acesso a Rota Restrita
```
1. Usuário tenta acessar rota (ex: /tickets)
2. Middleware verifica status da empresa
3. Se vencida: retorna erro 402
4. Frontend intercepta erro 402
5. Redireciona para /financeiro
6. Mostra mensagem de acesso restrito
```

### 3. Pagamento Confirmado via Webhook
```
1. Asaas envia webhook de pagamento confirmado
2. Backend processa webhook
3. Atualiza data de vencimento (+1 mês)
4. Ativa empresa
5. Sincroniza com Asaas
6. Notifica frontend via Socket.IO
```

## Rotas Permitidas para Empresas Vencidas

### ✅ Permitidas
- `/invoices/*` - Módulo financeiro completo
- `/companies/check-expiration` - Verificação de status
- `/auth/*` - Autenticação (logout, refresh, etc.)

### ❌ Bloqueadas
- `/tickets/*` - Atendimento
- `/contacts/*` - Contatos
- `/whatsapp/*` - WhatsApp
- `/campaigns/*` - Campanhas
- `/users/*` - Usuários
- Todas as outras rotas do sistema

## Status da Empresa

### Estados Possíveis
1. **Ativa**: `status: true, isExpired: false, isInTrial: false`
2. **Em Trial**: `isInTrial: true` (acesso completo)
3. **Vencida**: `isExpired: true` (acesso restrito)
4. **Inativa**: `status: false` (acesso restrito)

### Prioridade
1. `isInTrial = true` → Acesso completo
2. `isExpired = true` → Acesso restrito
3. `status = false` → Acesso restrito

## Testes Necessários

### ✅ Cenários Implementados
1. Login com empresa ativa → Acesso normal
2. Login com empresa vencida → Redireciona para financeiro
3. Tentativa de acesso restrito → Erro 402 + redirecionamento
4. Webhook de pagamento → Atualiza vencimento automaticamente

### 🔄 Próximos Passos
1. Atualizar demais rotas para usar `isAuthWithExpiredAccess`
2. Implementar testes automatizados
3. Configurar monitoramento de webhooks
4. Documentar para equipe de suporte

## Comandos para Testar

### Teste de Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@company.com","password":"password"}'
```

### Teste de Acesso Restrito
```bash
curl -X GET http://localhost:8080/tickets \
  -H "Authorization: Bearer TOKEN_DA_EMPRESA_VENCIDA"
# Deve retornar erro 402
```

### Teste de Acesso Permitido
```bash
curl -X GET http://localhost:8080/invoices \
  -H "Authorization: Bearer TOKEN_DA_EMPRESA_VENCIDA"
# Deve funcionar normalmente
```

### Simular Webhook
```bash
curl -X POST http://localhost:8080/subscription/create/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PAYMENT_CONFIRMED",
    "payment": {
      "id": "pay_123",
      "status": "RECEIVED",
      "value": 50.00
    }
  }'
```

## Logs Importantes

### Verificar Logs
```bash
# Logs de autenticação
grep "Login realizado" logs/app.log

# Logs de webhook
grep "Payment confirmed" logs/app.log

# Logs de acesso restrito
grep "Acesso restrito" logs/app.log

# Logs de sincronização
grep "due date updated" logs/app.log
```

## Monitoramento

### Métricas Sugeridas
- Número de logins de empresas vencidas por dia
- Taxa de conversão (pagamento após vencimento)
- Tempo médio para regularização
- Erros de webhook do Asaas
- Tentativas de acesso a rotas restritas

### Alertas Recomendados
- Falha no processamento de webhook
- Erro na sincronização com Asaas
- Alto número de acessos restritos
- Empresas com vencimento próximo (< 3 dias)

## Considerações de Segurança

1. **Validação de Webhook**: Implementar validação de assinatura do Asaas
2. **Rate Limiting**: Limitar tentativas de acesso a rotas restritas
3. **Auditoria**: Registrar todas as tentativas de acesso
4. **Dados Sensíveis**: Não expor informações financeiras desnecessárias
5. **Tokens**: Manter política de expiração adequada

## Suporte e Troubleshooting

### Problemas Comuns
1. **Empresa não atualiza após pagamento**
   - Verificar logs do webhook
   - Verificar configuração da API do Asaas
   - Executar sincronização manual

2. **Acesso negado incorretamente**
   - Verificar status da empresa no banco
   - Verificar datas de vencimento e trial
   - Limpar cache do frontend

3. **Frontend não redireciona**
   - Verificar se TrialGuard está ativo
   - Verificar interceptor de erro 402
   - Verificar dados da empresa no localStorage

### Comandos de Debug
```bash
# Verificar status de empresa específica
GET /companies/:id

# Forçar verificação de todas as empresas
GET /companies/check-expiration

# Sincronizar data de vencimento manualmente
PUT /companies/:id/sync-due-date

# Verificar logs em tempo real
tail -f logs/app.log | grep "company\|webhook\|payment"
```