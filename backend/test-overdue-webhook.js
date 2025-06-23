const axios = require('axios');

// URL do webhook
const WEBHOOK_URL = 'https://cf0f-45-227-118-221.ngrok-free.app/asaas/webhook';

// Webhook real de PAYMENT_OVERDUE que você recebeu
const overdueWebhookPayload = {
  "id": "evt_071da53af2a9613df04213d0157d6b88&9588328",
  "event": "PAYMENT_OVERDUE",
  "dateCreated": "2025-06-23 05:48:21",
  "payment": {
    "object": "payment",
    "id": "pay_49jucioh5v3tw85o",
    "dateCreated": "2025-06-23",
    "customer": "cus_000006795124",
    "subscription": "sub_tw3wu3btkgyn6vyg",
    "checkoutSession": null,
    "paymentLink": null,
    "value": 50,
    "netValue": 48.01,
    "originalValue": null,
    "interestValue": null,
    "description": "Assinatura Plano PRO - Matheus",
    "billingType": "BOLETO",
    "canBePaidAfterDueDate": true,
    "pixTransaction": null,
    "status": "OVERDUE",
    "dueDate": "2025-06-20",
    "originalDueDate": "2025-06-30",
    "paymentDate": null,
    "clientPaymentDate": null,
    "installmentNumber": null,
    "invoiceUrl": "https://sandbox.asaas.com/i/49jucioh5v3tw85o",
    "invoiceNumber": "09948724",
    "externalReference": "company_13_plan_3",
    "deleted": false,
    "anticipated": false,
    "anticipable": false,
    "creditDate": null,
    "estimatedCreditDate": null,
    "transactionReceiptUrl": null,
    "nossoNumero": "11089912",
    "bankSlipUrl": "https://sandbox.asaas.com/b/pdf/49jucioh5v3tw85o",
    "lastInvoiceViewedDate": null,
    "lastBankSlipViewedDate": null,
    "discount": {
      "value": 0,
      "limitDate": null,
      "dueDateLimitDays": 0,
      "type": "FIXED"
    },
    "fine": {
      "value": 0,
      "type": "FIXED"
    },
    "interest": {
      "value": 0,
      "type": "PERCENTAGE"
    },
    "postalService": false,
    "custody": null,
    "escrow": null,
    "refunds": null
  }
};

async function testOverdueWebhook() {
  try {
    console.log('🧪 Testando webhook PAYMENT_OVERDUE...\n');
    
    console.log('📋 Dados do webhook:');
    console.log(`Event: ${overdueWebhookPayload.event}`);
    console.log(`Payment ID: ${overdueWebhookPayload.payment.id}`);
    console.log(`Status: ${overdueWebhookPayload.payment.status}`);
    console.log(`External Reference: ${overdueWebhookPayload.payment.externalReference}`);
    console.log('');

    console.log('📤 Enviando webhook...');
    
    const response = await axios.post(WEBHOOK_URL, overdueWebhookPayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Asaas-Webhook'
      },
      timeout: 10000
    });

    console.log('✅ Webhook processado com sucesso!');
    console.log('📊 Status:', response.status);
    console.log('📄 Resposta:', response.data);

    console.log('\n🎯 O que deve acontecer:');
    console.log('1. ✅ Fatura ID 29 deve ser atualizada para status "OVERDUE"');
    console.log('2. ✅ Evento Socket.IO deve ser emitido: company-13-invoice-updated');
    console.log('3. ✅ Frontend deve receber a notificação');
    console.log('4. ✅ Status na tela deve mudar para "Vencido"');
    console.log('5. ✅ Toast de aviso deve aparecer');

    console.log('\n💡 Para testar no frontend:');
    console.log('1. Mantenha a página de Financeiro aberta');
    console.log('2. Execute este script');
    console.log('3. Observe se o status muda de "Em Aberto" para "Vencido"');
    console.log('4. Verifique se aparece a notificação de vencimento');

    console.log('\n🔍 Se não funcionar, verifique:');
    console.log('• Console do navegador para erros de Socket.IO');
    console.log('• Logs do backend para confirmar emissão do evento');
    console.log('• Se o usuário está logado na empresa correta (ID: 13)');

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

testOverdueWebhook();