# Configuração do Webhook Asaas com ngrok

## Status do ngrok
✅ ngrok está rodando e configurado!

### URLs importantes:
- **URL pública do webhook**: `https://46e9-45-227-118-221.ngrok-free.app/asaas/webhook`
- **Interface web do ngrok**: http://127.0.0.1:4040
- **Servidor local**: http://localhost:8080

## Como configurar no Asaas

### 1. Acesse o painel do Asaas
- Entre na sua conta do Asaas (sandbox ou produção)
- Vá para **Configurações** > **Webhooks** ou **API** > **Webhooks**

### 2. Configure o webhook
- **URL do Webhook**: `https://46e9-45-227-118-221.ngrok-free.app/asaas/webhook`
- **Eventos para monitorar**:
  - ✅ PAYMENT_CREATED (Pagamento criado)
  - ✅ PAYMENT_CONFIRMED (Pagamento confirmado)
  - ✅ PAYMENT_RECEIVED (Pagamento recebido)
  - ✅ PAYMENT_OVERDUE (Pagamento em atraso)
  - ✅ PAYMENT_DELETED (Pagamento excluído)

### 3. Teste o webhook
Você pode testar o webhook de várias formas:

#### Opção 1: Pelo painel do Asaas
- Use a função "Testar Webhook" no painel do Asaas

#### Opção 2: Usando curl (para teste manual)
```bash
curl -X POST https://46e9-45-227-118-221.ngrok-free.app/asaas/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PAYMENT_CREATED",
    "payment": {
      "id": "pay_test123",
      "customer": "cus_test123",
      "value": 100.00,
      "netValue": 95.00,
      "description": "Teste de webhook",
      "billingType": "CREDIT_CARD",
      "status": "PENDING",
      "invoiceUrl": "https://sandbox.asaas.com/invoice/test",
      "invoiceNumber": "000001",
      "originalDueDate": "2024-01-01",
      "externalReference": "company_1_test"
    }
  }'
```

## Monitoramento

### 1. Logs do ngrok
- Acesse http://127.0.0.1:4040 para ver todas as requisições em tempo real
- Você pode ver headers, body, response, etc.

### 2. Logs da aplicação
- Os logs da aplicação aparecerão no terminal onde você rodou `npm run dev`
- Procure por mensagens como: `Processing Asaas webhook: PAYMENT_CREATED for payment pay_test123`

### 3. Banco de dados
- Verifique a tabela `Invoices` para ver se as faturas estão sendo criadas
- Verifique a tabela `Companies` para ver se o status está sendo atualizado

## Comandos úteis

### Para iniciar o backend (se não estiver rodando):
```bash
cd backend
npm run dev
```

### Para verificar se o ngrok está funcionando:
```bash
curl https://46e9-45-227-118-221.ngrok-free.app/asaas/webhook
```

### Para parar o ngrok:
- Pressione `Ctrl+C` no terminal onde o ngrok está rodando

## Importante ⚠️

1. **URL temporária**: A URL do ngrok (`https://46e9-45-227-118-221.ngrok-free.app`) é temporária e muda toda vez que você reinicia o ngrok
2. **Mantenha rodando**: Deixe o ngrok rodando enquanto estiver testando
3. **Firewall**: Certifique-se de que o backend está rodando na porta 8080
4. **Ambiente**: Configure o webhook no ambiente correto (sandbox/produção)

## Próximos passos

1. ✅ Configure o webhook no painel do Asaas com a URL fornecida
2. ✅ Inicie o backend (`npm run dev`)
3. ✅ Teste criando um pagamento no Asaas
4. ✅ Monitore os logs no ngrok (http://127.0.0.1:4040)
5. ✅ Verifique se os dados estão sendo salvos no banco

## Troubleshooting

### Se o webhook não funcionar:
1. Verifique se o backend está rodando na porta 8080
2. Verifique se o ngrok está ativo
3. Teste a URL manualmente com curl
4. Verifique os logs da aplicação
5. Verifique a configuração do Asaas

### Se a URL do ngrok mudar:
1. Pare o ngrok (Ctrl+C)
2. Inicie novamente: `ngrok http 8080`
3. Atualize a URL no painel do Asaas