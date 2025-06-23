const axios = require('axios');

// URL do webhook (ngrok atualizado)
const WEBHOOK_URL = 'https://cf0f-45-227-118-221.ngrok-free.app/asaas/webhook';

// Simular webhook de pagamento confirmado
async function testPaymentConfirmed() {
  try {
    console.log('🧪 Testando webhook de pagamento confirmado...\n');

    // Usar um ID de pagamento real do banco de dados
    const paymentConfirmedPayload = {
      event: "PAYMENT_CONFIRMED",
      payment: {
        id: "pay_a04arol7r7kagyfi", // ID real da fatura do ogabiru
        customer: "cus_test123",
        subscription: "sub_test123",
        value: 50.00,
        netValue: 47.50,
        description: "Assinatura Plano PRO - ogabiru",
        billingType: "CREDIT_CARD",
        status: "CONFIRMED",
        paymentDate: new Date().toISOString().split('T')[0],
        confirmedDate: new Date().toISOString().split('T')[0],
        paymentMethod: "CREDIT_CARD",
        invoiceUrl: "https://sandbox.asaas.com/i/a04arol7r7kagyfi",
        invoiceNumber: "000002",
        originalDueDate: "2024-12-31",
        externalReference: "company_10_confirmed_" + Date.now()
      }
    };

    console.log('📤 Enviando webhook de pagamento confirmado...');
    console.log('📋 Dados:', JSON.stringify(paymentConfirmedPayload, null, 2));

    const response = await axios.post(WEBHOOK_URL, paymentConfirmedPayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Asaas-Webhook-Test'
      },
      timeout: 10000
    });

    console.log('✅ Webhook processado com sucesso!');
    console.log('📊 Status:', response.status);
    console.log('📄 Resposta:', response.data);

    console.log('\n🎯 O que deve acontecer:');
    console.log('1. ✅ Status da fatura deve ser atualizado para "CONFIRMED"');
    console.log('2. ✅ Data de pagamento deve ser registrada');
    console.log('3. ✅ Método de pagamento deve ser salvo');
    console.log('4. ✅ Status da empresa deve ser ativado');
    console.log('5. ✅ Evento Socket.IO deve ser emitido');
    console.log('6. ✅ Frontend deve mostrar bolinha verde com "PAGO"');

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

// Testar também com o outro pagamento
async function testSecondPayment() {
  try {
    console.log('\n🧪 Testando segundo pagamento...\n');

    const paymentConfirmedPayload = {
      event: "PAYMENT_CONFIRMED",
      payment: {
        id: "pay_vnbq1ch75uj6mb2x", // ID real da fatura do Matheus Santos
        customer: "cus_test456",
        value: 50.00,
        netValue: 47.50,
        description: "Assinatura Plano PRO - Matheus Santos",
        billingType: "PIX",
        status: "CONFIRMED",
        paymentDate: new Date().toISOString().split('T')[0],
        confirmedDate: new Date().toISOString().split('T')[0],
        paymentMethod: "PIX",
        invoiceUrl: "https://sandbox.asaas.com/i/vnbq1ch75uj6mb2x",
        invoiceNumber: "000001",
        originalDueDate: "2024-12-31",
        externalReference: "company_9_confirmed_" + Date.now()
      }
    };

    console.log('📤 Enviando segundo webhook...');
    
    const response = await axios.post(WEBHOOK_URL, paymentConfirmedPayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Asaas-Webhook-Test'
      },
      timeout: 10000
    });

    console.log('✅ Segundo webhook processado com sucesso!');
    console.log('📊 Status:', response.status);

  } catch (error) {
    console.log('❌ Erro no segundo webhook:', error.response?.data || error.message);
  }
}

async function runTests() {
  await testPaymentConfirmed();
  
  // Aguardar um pouco antes do segundo teste
  setTimeout(async () => {
    await testSecondPayment();
    
    console.log('\n✨ Testes concluídos!');
    console.log('💡 Dicas:');
    console.log('- Verifique os logs do backend para confirmar o processamento');
    console.log('- Acesse a tela de Financeiro para ver as bolinhas verdes');
    console.log('- Verifique se as notificações aparecem em tempo real');
  }, 2000);
}

runTests();