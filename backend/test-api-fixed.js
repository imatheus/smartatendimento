const axios = require('axios');
require('dotenv').config();

async function testFixedAPI() {
  const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
  const token = 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8'; // Token da conexão Disrupta
  
  console.log('🧪 Testando API Corrigida\n');
  console.log(`URL: ${baseURL}/api/messages/send`);
  console.log(`Token: ${token.substring(0, 10)}...`);
  
  const testData = {
    number: '5511999999999', // Número de teste
    body: 'Teste da API corrigida - sem filas'
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
      
      // Verificar se é o erro específico que estávamos corrigindo
      if (error.response.data && error.response.data.error) {
        if (error.response.data.error.includes('messageQueue')) {
          console.log('\n🔧 ERRO AINDA PRESENTE: messageQueue não encontrada');
          console.log('A correção não foi aplicada corretamente.');
        } else {
          console.log('\n✅ CORREÇÃO APLICADA: Erro específico, não mais genérico');
        }
      }
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

testFixedAPI();