const axios = require('axios');

// Configurações da API
const API_BASE_URL = 'http://localhost:8080';

async function testInvoicesAPI() {
  try {
    console.log('🧪 Testando API de faturas...\n');

    // 1. Fazer login para obter token
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'matheus@berlin.com', // Usuário da empresa "Matheus Santos" (ID: 9)
      password: 'admin' // Ajuste a senha conforme necessário
    });

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log(`✅ Login realizado com sucesso!`);
    console.log(`👤 Usuário: ${user.name} (ID: ${user.id})`);
    console.log(`🏢 Empresa: ${user.companyId}\n`);

    // 2. Testar endpoint de faturas
    console.log('📋 Buscando faturas...');
    const invoicesResponse = await axios.get(`${API_BASE_URL}/invoices/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const invoices = invoicesResponse.data;
    console.log(`✅ Faturas encontradas: ${invoices.length}`);
    
    if (invoices.length > 0) {
      console.table(invoices.map(inv => ({
        id: inv.id,
        detail: inv.detail,
        value: inv.value,
        status: inv.status,
        companyId: inv.companyId,
        dueDate: inv.dueDate,
        asaasInvoiceId: inv.asaasInvoiceId
      })));
    } else {
      console.log('❌ Nenhuma fatura encontrada para este usuário');
      console.log(`🔍 CompanyId do usuário: ${user.companyId}`);
      
      // Verificar se existem faturas para outras empresas
      console.log('\n🔍 Verificando faturas de todas as empresas...');
      const allInvoicesResponse = await axios.get(`${API_BASE_URL}/invoices`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Resposta completa:', allInvoicesResponse.data);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Dica: Verifique se as credenciais estão corretas');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Verifique se o backend está rodando na porta 8080');
    }
  }
}

// Teste adicional com outro usuário
async function testWithAnotherUser() {
  try {
    console.log('\n🧪 Testando com outro usuário...\n');

    // Login com usuário da empresa "ogabiru" (ID: 10)
    console.log('🔐 Fazendo login com ogabiru...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'gabiru@gmail.com',
      password: 'admin' // Ajuste a senha conforme necessário
    });

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log(`✅ Login realizado com sucesso!`);
    console.log(`👤 Usuário: ${user.name} (ID: ${user.id})`);
    console.log(`🏢 Empresa: ${user.companyId}\n`);

    // Buscar faturas
    console.log('📋 Buscando faturas...');
    const invoicesResponse = await axios.get(`${API_BASE_URL}/invoices/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const invoices = invoicesResponse.data;
    console.log(`✅ Faturas encontradas: ${invoices.length}`);
    
    if (invoices.length > 0) {
      console.table(invoices.map(inv => ({
        id: inv.id,
        detail: inv.detail,
        value: inv.value,
        status: inv.status,
        companyId: inv.companyId,
        dueDate: inv.dueDate
      })));
    }

  } catch (error) {
    console.error('❌ Erro no teste com segundo usuário:', error.response?.data || error.message);
  }
}

// Executar testes
async function runAllTests() {
  await testInvoicesAPI();
  await testWithAnotherUser();
}

runAllTests();