const axios = require('axios');
require('dotenv').config();

async function testAPI() {
  const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
  const token = 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8'; // Token da conexão Disrupta
  
  console.log('🧪 Testando API de Mensagens\n');
  console.log(`URL: ${baseURL}/api/messages/send`);
  console.log(`Token: ${token.substring(0, 10)}...`);
  
  const testData = {
    number: '5511999999999', // Número de teste
    body: 'Mensagem de teste da API'
  };
  
  try {
    console.log('\n📤 Enviando requisição...');
    console.log('Dados:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(`${baseURL}/api/messages/send`, testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000 // 30 segundos
    });
    
    console.log('\n✅ Sucesso!');
    console.log('Status:', response.status);
    console.log('Resposta:', response.data);
    
  } catch (error) {
    console.log('\n❌ Erro na requisição:');
    
    if (error.response) {
      // Erro de resposta do servidor
      console.log('Status:', error.response.status);
      console.log('Dados:', error.response.data);
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      // Erro de rede
      console.log('Erro de rede:', error.message);
      console.log('Código:', error.code);
    } else {
      // Outro erro
      console.log('Erro:', error.message);
    }
  }
}

// Teste com número inválido
async function testInvalidNumber() {
  const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
  const token = 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8';
  
  console.log('\n🧪 Testando com número inválido...');
  
  const testData = {
    number: '123456789', // Número inválido
    body: 'Teste com número inválido'
  };
  
  try {
    const response = await axios.post(`${baseURL}/api/messages/send`, testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Resposta:', response.data);
    
  } catch (error) {
    console.log('❌ Erro esperado:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Mensagem:', error.response.data);
    }
  }
}

// Teste sem token
async function testWithoutToken() {
  const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
  
  console.log('\n🧪 Testando sem token...');
  
  const testData = {
    number: '5511999999999',
    body: 'Teste sem token'
  };
  
  try {
    const response = await axios.post(`${baseURL}/api/messages/send`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Resposta:', response.data);
    
  } catch (error) {
    console.log('❌ Erro esperado:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Mensagem:', error.response.data);
    }
  }
}

async function runAllTests() {
  await testAPI();
  await testInvalidNumber();
  await testWithoutToken();
  
  console.log('\n📋 Resumo dos testes concluído!');
  console.log('Se todos os erros foram tratados adequadamente, a API está funcionando corretamente.');
}

runAllTests();