const axios = require('axios');

// URL do webhook (atualize se necessário)
const WEBHOOK_URL = 'https://46e9-45-227-118-221.ngrok-free.app/asaas/webhook';

// Dados de teste para diferentes eventos
const testPayloads = {
  PAYMENT_CREATED: {
    event: "PAYMENT_CREATED",
    payment: {
      id: "pay_test_" + Date.now(),
      customer: "cus_test123",
      subscription: "sub_test123",
      value: 100.00,
      netValue: 95.00,
      description: "Teste de webhook - Pagamento criado",
      billingType: "CREDIT_CARD",
      status: "PENDING",
      invoiceUrl: "https://sandbox.asaas.com/invoice/test",
      invoiceNumber: "000001",
      originalDueDate: "2024-12-31",
      externalReference: "company_1_test_" + Date.now()
    }
  },
  
  PAYMENT_CONFIRMED: {
    event: "PAYMENT_CONFIRMED",
    payment: {
      id: "pay_test_confirmed_" + Date.now(),
      customer: "cus_test123",
      subscription: "sub_test123",
      value: 100.00,
      netValue: 95.00,
      description: "Teste de webhook - Pagamento confirmado",
      billingType: "CREDIT_CARD",
      status: "CONFIRMED",
      paymentDate: new Date().toISOString().split('T')[0],
      confirmedDate: new Date().toISOString().split('T')[0],
      paymentMethod: "CREDIT_CARD",
      invoiceUrl: "https://sandbox.asaas.com/invoice/test",
      invoiceNumber: "000002",
      originalDueDate: "2024-12-31",
      externalReference: "company_1_confirmed_" + Date.now()
    }
  },
  
  PAYMENT_OVERDUE: {
    event: "PAYMENT_OVERDUE",
    payment: {
      id: "pay_test_overdue_" + Date.now(),
      customer: "cus_test123",
      value: 100.00,
      netValue: 95.00,
      description: "Teste de webhook - Pagamento em atraso",
      billingType: "BOLETO",
      status: "OVERDUE",
      invoiceUrl: "https://sandbox.asaas.com/invoice/test",
      invoiceNumber: "000003",
      originalDueDate: "2024-01-01",
      externalReference: "company_1_overdue_" + Date.now()
    }
  }
};

async function testWebhook(eventType) {
  try {
    console.log(`\n🧪 Testando evento: ${eventType}`);
    console.log('📤 Enviando payload...');
    
    const payload = testPayloads[eventType];
    console.log('📋 Dados:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Asaas-Webhook-Test'
      },
      timeout: 10000
    });
    
    console.log('✅ Sucesso!');
    console.log('📊 Status:', response.status);
    console.log('📄 Resposta:', response.data);
    
  } catch (error) {
    console.log('❌ Erro!');
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

async function testAllEvents() {
  console.log('🚀 Iniciando testes do webhook Asaas');
  console.log('🌐 URL:', WEBHOOK_URL);
  
  for (const eventType of Object.keys(testPayloads)) {
    await testWebhook(eventType);
    // Aguardar um pouco entre os testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✨ Testes concluídos!');
  console.log('💡 Dica: Verifique os logs do ngrok em http://127.0.0.1:4040');
}

// Executar testes
if (require.main === module) {
  const eventType = process.argv[2];
  
  if (eventType && testPayloads[eventType]) {
    testWebhook(eventType);
  } else if (eventType) {
    console.log('❌ Evento inválido. Eventos disponíveis:', Object.keys(testPayloads).join(', '));
  } else {
    testAllEvents();
  }
}

module.exports = { testWebhook, testPayloads };