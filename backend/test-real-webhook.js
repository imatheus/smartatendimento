const axios = require('axios');

// URL do webhook
const WEBHOOK_URL = 'https://cf0f-45-227-118-221.ngrok-free.app/asaas/webhook';

// Webhook real que você recebeu
const realWebhookPayload = {
  "id": "evt_d26e303b238e509335ac9ba210e51b0f&9588262",
  "event": "PAYMENT_RECEIVED",
  "dateCreated": "2025-06-23 04:55:15",
  "payment": {
    "object": "payment",
    "id": "pay_a04arol7r7kagyfi",
    "dateCreated": "2025-06-23",
    "customer": "cus_000006795110",
    "subscription": "sub_sn7henjw9tol6qtc",
    "checkoutSession": null,
    "paymentLink": null,
    "value": 50,
    "netValue": 50,
    "originalValue": null,
    "interestValue": null,
    "description": "Assinatura Plano PRO - ogabiru",
    "billingType": "BOLETO",
    "canBePaidAfterDueDate": true,
    "pixTransaction": null,
    "status": "RECEIVED_IN_CASH",
    "dueDate": "2025-06-30",
    "originalDueDate": "2025-06-30",
    "paymentDate": "2025-06-23",
    "clientPaymentDate": "2025-06-23",
    "installmentNumber": null,
    "invoiceUrl": "https://sandbox.asaas.com/i/a04arol7r7kagyfi",
    "invoiceNumber": "09947709",
    "externalReference": "company_10_plan_3",
    "deleted": false,
    "anticipated": false,
    "anticipable": false,
    "creditDate": null,
    "estimatedCreditDate": null,
    "transactionReceiptUrl": null,
    "nossoNumero": "11089892",
    "bankSlipUrl": "https://sandbox.asaas.com/b/pdf/a04arol7r7kagyfi",
    "lastInvoiceViewedDate": "2025-06-23T07:44:14Z",
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

async function testRealWebhook() {
  try {
    console.log('🧪 Testando webhook real do Asaas...\n');
    console.log('📋 Dados do webhook real:');
    console.log(`Event: ${realWebhookPayload.event}`);
    console.log(`Payment ID: ${realWebhookPayload.payment.id}`);
    console.log(`Status: ${realWebhookPayload.payment.status}`);
    console.log(`Payment Date: ${realWebhookPayload.payment.paymentDate}`);
    console.log(`External Reference: ${realWebhookPayload.payment.externalReference}`);
    console.log('');

    console.log('📤 Enviando webhook...');
    
    const response = await axios.post(WEBHOOK_URL, realWebhookPayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Asaas-Webhook'
      },
      timeout: 10000
    });

    console.log('✅ Webhook processado com sucesso!');
    console.log('📊 Status:', response.status);
    console.log('📄 Resposta:', response.data);

    console.log('\n🎯 O que deve acontecer agora:');
    console.log('1. ✅ Fatura ID 2 (ogabiru) deve ter status "RECEIVED_IN_CASH"');
    console.log('2. ✅ Data de pagamento deve ser "2025-06-23"');
    console.log('3. ✅ Método de pagamento deve ser "BOLETO"');
    console.log('4. ✅ Frontend deve mostrar bolinha verde com "PAGO"');
    console.log('5. ✅ Notificação em tempo real deve aparecer');

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

testRealWebhook();