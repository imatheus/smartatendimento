# Script para Atualizar Middleware em Todas as Rotas

Este documento lista todas as rotas que precisam ser atualizadas para usar o novo middleware `isAuthWithExpiredAccess`.

## Rotas Já Atualizadas
- ✅ `/routes/companyRoutes.ts`
- ✅ `/routes/invoicesRoutes.ts`
- ✅ `/routes/userRoutes.ts`

## Rotas que Precisam ser Atualizadas

### Rotas Principais (Devem usar isAuthWithExpiredAccess)
- `/routes/ticketRoutes.ts`
- `/routes/contactRoutes.ts`
- `/routes/whatsappRoutes.ts`
- `/routes/queueRoutes.ts`
- `/routes/settingRoutes.ts`
- `/routes/messageRoutes.ts`
- `/routes/dashboardRoutes.ts`
- `/routes/campaignRoutes.ts`
- `/routes/planRoutes.ts`
- `/routes/tagRoutes.ts`
- `/routes/quickMessageRoutes.ts`
- `/routes/scheduleRoutes.ts`
- `/routes/helpRoutes.ts`

### Rotas que Devem Manter isAuth Original
- `/routes/authRoutes.ts` (rotas de autenticação)
- `/routes/asaasRoutes.ts` (apenas super usuários)

## Comando para Atualizar Automaticamente

Para atualizar todas as rotas de uma vez, você pode usar este comando no terminal:

```bash
# Navegar para o diretório de rotas
cd backend/src/routes

# Adicionar import do novo middleware em todos os arquivos
find . -name "*.ts" -not -name "authRoutes.ts" -not -name "asaasRoutes.ts" -exec sed -i '/import isAuth from/a import isAuthWithExpiredAccess from "../middleware/isAuthWithExpiredAccess";' {} \;

# Substituir isAuth por isAuthWithExpiredAccess (exceto em authRoutes e asaasRoutes)
find . -name "*.ts" -not -name "authRoutes.ts" -not -name "asaasRoutes.ts" -exec sed -i 's/, isAuth,/, isAuthWithExpiredAccess,/g' {} \;
find . -name "*.ts" -not -name "authRoutes.ts" -not -name "asaasRoutes.ts" -exec sed -i 's/isAuth,/isAuthWithExpiredAccess,/g' {} \;
```

## Verificação Manual Necessária

Após executar o script, verifique manualmente:

1. **authRoutes.ts** - Deve manter `isAuth` original
2. **asaasRoutes.ts** - Deve manter `isAuth` + `isSuperUser`
3. **Rotas públicas** - Não devem ter middleware de autenticação

## Teste da Implementação

1. **Login com empresa ativa**: Deve funcionar normalmente
2. **Login com empresa vencida**: Deve permitir login mas restringir acesso
3. **Acesso ao financeiro com empresa vencida**: Deve ser permitido
4. **Acesso a outras telas com empresa vencida**: Deve ser bloqueado
5. **Webhook de pagamento**: Deve atualizar data de vencimento automaticamente