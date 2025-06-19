# Solução para Erro na API de Mensagens

## Problema Identificado
O erro "Não foi possível enviar a mensagem, tente novamente em alguns instantes" com status 400 estava ocorrendo devido a problemas na validação e tratamento de erros na API.

## Correções Implementadas

### 1. Melhorias no MessageController
- ✅ Adicionada validação do status da conexão WhatsApp
- ✅ Melhor tratamento de erros específicos
- ✅ Mensagens de erro mais descritivas
- ✅ Validação adequada do token e conexão

### 2. Melhorias no Middleware de Autenticação
- ✅ Validação completa do header Authorization
- ✅ Verificação do formato do token
- ✅ Mensagens de erro mais específicas

### 3. Diagnóstico Automático
- ✅ Script de diagnóstico para identificar problemas
- ✅ Verificação de conexões WhatsApp
- ✅ Validação de configurações

## Como Testar a Correção

### 1. Verificar Conexões WhatsApp
Execute o diagnóstico:
```bash
cd backend
node diagnose-api.js
```

### 2. Verificar Configurações Necessárias
- ✅ Pelo menos uma conexão WhatsApp deve estar **CONECTADA**
- ✅ Uma conexão deve estar marcada como **PADRÃO** (isDefault = true)
- ✅ A conexão deve ter um **TOKEN** válido

### 3. Testar a API
Use o teste automatizado:
```bash
cd backend
node test-api.js
```

Ou teste manualmente com cURL:
```bash
curl -X POST "http://localhost:8080/api/messages/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "number": "5511999999999",
    "body": "Mensagem de teste"
  }'
```

## Possíveis Erros e Soluções

### Erro 401: Token inválido
**Causa:** Token não fornecido ou inválido
**Solução:** 
1. Vá em Integrações > Conexões
2. Copie o token da conexão WhatsApp ativa
3. Use no header: `Authorization: Bearer SEU_TOKEN`

### Erro 400: WhatsApp não conectado
**Causa:** Conexão WhatsApp não está ativa
**Solução:**
1. Vá em Conexões
2. Reconecte o WhatsApp
3. Aguarde status "CONNECTED"

### Erro 400: Nenhuma conexão padrão
**Causa:** Nenhuma conexão marcada como padrão
**Solução:**
1. Vá em Conexões
2. Marque uma conexão como "Padrão"
3. Salve as alterações

### Erro 400: Número não possui WhatsApp
**Causa:** Número testado não tem WhatsApp ativo
**Solução:**
1. Use um número válido com WhatsApp
2. Formato: código país + DDD + número (ex: 5511999999999)

## Formato Correto do Número
- ✅ **Correto:** 5511999999999
- ❌ **Incorreto:** +55 (11) 99999-9999
- ❌ **Incorreto:** 11999999999
- ❌ **Incorreto:** 5511 99999-9999

## Testando na Interface
1. Acesse **Integrações > API**
2. Preencha os campos:
   - **Token:** Token da conexão WhatsApp
   - **Número:** Número válido (5511999999999)
   - **Mensagem:** Texto da mensagem
3. Clique em **Enviar Mensagem**

## Logs para Depuração
Se ainda houver problemas, verifique os logs do backend:
```bash
cd backend
npm run dev
```

Os logs mostrarão erros detalhados para facilitar a identificação do problema.

## Verificação Final
Após as correções, a API deve:
1. ✅ Retornar erros específicos e claros
2. ✅ Validar adequadamente tokens e conexões
3. ✅ Funcionar corretamente com configurações válidas
4. ✅ Fornecer feedback útil para resolução de problemas

## Contato para Suporte
Se o problema persistir após seguir este guia, forneça:
1. Resultado do diagnóstico (`node diagnose-api.js`)
2. Logs do erro específico
3. Configuração da conexão WhatsApp utilizada