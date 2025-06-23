const axios = require('axios');

// URL do webhook
const WEBHOOK_URL = 'https://cf0f-45-227-118-221.ngrok-free.app/asaas/webhook';

// Simular webhook de nova fatura criada
const newInvoiceWebhook = {
  "id": "evt_new_invoice_test_" + Date.now(),
  "event": "PAYMENT_CREATED",
  "dateCreated": new Date().toISOString().split('T')[0] + " " + new Date().toTimeString().split(' ')[0],
  "payment": {
    "object": "payment",
    "id": "pay_test_new_" + Date.now(),
    "dateCreated": new Date().toISOString().split('T')[0],
    "customer": "cus_000006795110",
    "subscription": "sub_test_new_" + Date.now(),
    "value": 75.00,
    "netValue": 75.00,
    "description": "Nova Fatura Teste - Plano Premium",
    "billingType": "CREDIT_CARD",
    "status": "PENDING",
    "dueDate": "2025-07-15",
    "originalDueDate": "2025-07-15",
    "invoiceUrl": "https://sandbox.asaas.com/i/test_new_" + Date.now(),
    "invoiceNumber": "TEST" + Date.now(),
    "externalReference": "company_10_plan_premium_" + Date.now(),
    "deleted": false,
    "anticipated": false,
    "anticipable": false
  }
};

async function testNewInvoiceCreation() {
  try {
    console.log('🧪 Testando criação automática de nova fatura...\n');
    
    console.log('📋 Dados da nova fatura:');
    console.log(`Event: ${newInvoiceWebhook.event}`);
    console.log(`Payment ID: ${newInvoiceWebhook.payment.id}`);
    console.log(`Descrição: ${newInvoiceWebhook.payment.description}`);
    console.log(`Valor: R$ ${newInvoiceWebhook.payment.value.toFixed(2)}`);
    console.log(`Status: ${newInvoiceWebhook.payment.status}`);
    console.log(`Vencimento: ${newInvoiceWebhook.payment.dueDate}`);
    console.log(`External Reference: ${newInvoiceWebhook.payment.externalReference}`);
    console.log('');

    console.log('📤 Enviando webhook de nova fatura...');
    
    const response = await axios.post(WEBHOOK_URL, newInvoiceWebhook, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Asaas-Webhook'
      },
      timeout: 10000
    });

    console.log('✅ Webhook processado com sucesso!');
    console.log('📊 Status:', response.status);
    console.log('📄 Resposta:', response.data);

    console.log('\n🎯 O que deve acontecer automaticamente:');
    console.log('1. ✅ Nova fatura deve ser criada no banco de dados');
    console.log('2. ✅ Evento Socket.IO deve ser emitido');
    console.log('3. ✅ Frontend deve receber a notificação em tempo real');
    console.log('4. ✅ Nova fatura deve aparecer na lista automaticamente');
    console.log('5. ✅ Notificação toast deve aparecer: "📄 Nova fatura criada"');
    console.log('6. ✅ Usuário NÃO precisa clicar em "Sincronizar Faturas"');

    console.log('\n💡 Para testar:');
    console.log('1. Mantenha a página de Financeiro aberta');
    console.log('2. Execute este script');
    console.log('3. Veja a nova fatura aparecer automaticamente na lista');
    console.log('4. Observe a notificação toast no canto da tela');

  } catch (error) {
    console.log('❌ Erro ao processar webhook!');
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📄 Resposta:', error.response.data);
    } else if (error.request) {
      console.log('🔌 Erro de conexão:', error.message);
    } else {
      console.log('⚠️ Erro:', error.message);
    }
  }
}

testNewInvoiceCreation();