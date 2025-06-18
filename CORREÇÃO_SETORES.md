# Correção do Problema de Setores

## Problema Identificado

Quando você excluiu o primeiro setor cadastrado, o sistema não mostrou os outros setores disponíveis. Isso acontece porque:

1. **Falta de Foreign Keys com CASCADE**: As tabelas `WhatsappQueues` e `UserQueues` não têm foreign keys com CASCADE configuradas
2. **Registros Órfãos**: Quando um setor é excluído, os registros nas tabelas de associação ficam órfãos
3. **Sistema não filtra registros órfãos**: O sistema tenta carregar setores que não existem mais

## Alterações Realizadas

### 1. Migrações Criadas

- `20241201000000-add-foreign-keys-to-whatsapp-queues.ts`: Adiciona foreign keys com CASCADE para WhatsappQueues
- `20241201000001-add-foreign-keys-to-user-queues.ts`: Adiciona foreign keys com CASCADE para UserQueues

### 2. Logs de Debug Adicionados

- Logs na função `verifyQueue` para mostrar quantos setores são encontrados
- Logs no `ShowWhatsAppService` para verificar setores carregados
- Logs para rastrear seleção de setores pelo usuário

### 3. Script SQL de Verificação

- `fix-orphaned-queues.sql`: Script para verificar e limpar registros órfãos manualmente

## Como Aplicar a Correção

### Passo 1: Executar as Migrações

```bash
cd backend
npm run typeorm migration:run
```

### Passo 2: Reiniciar o Backend

```bash
npm run dev
```

### Passo 3: Testar

1. Crie um novo contato no WhatsApp
2. Verifique os logs no console do backend
3. Confirme se todos os setores são mostrados

### Passo 4: Remover Logs de Debug (Opcional)

Após confirmar que está funcionando, você pode remover os logs de debug dos arquivos:
- `backend/src/services/WbotServices/wbotMessageListener.ts`
- `backend/src/services/WhatsappService/ShowWhatsAppService.ts`

## Verificação Manual (Opcional)

Se quiser verificar o banco antes de aplicar as migrações:

1. Conecte no banco de dados
2. Execute o script `fix-orphaned-queues.sql`
3. Verifique se há registros órfãos

## O que as Migrações Fazem

1. **Limpam registros órfãos** existentes nas tabelas WhatsappQueues e UserQueues
2. **Adicionam foreign keys** com CASCADE para garantir integridade referencial
3. **Previnem problemas futuros** quando setores forem excluídos

## Resultado Esperado

Após aplicar as correções:
- ✅ Todos os setores cadastrados serão mostrados para novos contatos
- ✅ Exclusão de setores não deixará registros órfãos
- ✅ Sistema funcionará corretamente independente de qual setor for excluído
- ✅ Logs de debug ajudarão a identificar problemas futuros

## Observações Importantes

- As migrações são seguras e não afetarão dados válidos
- Os logs de debug podem ser removidos após confirmar o funcionamento
- Recomenda-se fazer backup do banco antes de aplicar as migrações