const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuração do banco de dados PostgreSQL
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'smart_atendimento_db',
  logging: false
});

async function diagnoseAPI() {
  try {
    console.log('🔍 Diagnóstico da API de Mensagens\n');

    // Conectar ao banco
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida');

    // Verificar tabela Whatsapp
    const [whatsapps] = await sequelize.query(`
      SELECT id, name, status, token, "isDefault", "companyId" 
      FROM "Whatsapps" 
      ORDER BY "companyId", "isDefault" DESC
    `);

    console.log('\n📱 Conexões WhatsApp encontradas:');
    if (whatsapps.length === 0) {
      console.log('❌ Nenhuma conexão WhatsApp encontrada');
      console.log('   Solução: Crie uma conexão WhatsApp na seção "Conexões"');
      return;
    }

    whatsapps.forEach((wa, index) => {
      console.log(`\n${index + 1}. ${wa.name}`);
      console.log(`   ID: ${wa.id}`);
      console.log(`   Status: ${wa.status || 'NÃO DEFINIDO'}`);
      console.log(`   Token: ${wa.token ? wa.token.substring(0, 10) + '...' : 'NÃO DEFINIDO'}`);
      console.log(`   Padrão: ${wa.isDefault ? 'SIM' : 'NÃO'}`);
      console.log(`   Empresa: ${wa.companyId}`);
      
      // Verificar problemas
      const problems = [];
      if (!wa.status) problems.push('Status não definido');
      if (wa.status !== 'CONNECTED') problems.push('Não está conectado');
      if (!wa.token) problems.push('Token não definido');
      if (!wa.isDefault) problems.push('Não é conexão padrão');
      
      if (problems.length > 0) {
        console.log(`   ⚠️  Problemas: ${problems.join(', ')}`);
      } else {
        console.log('   ✅ Configuração OK');
      }
    });

    // Verificar conexões padrão por empresa
    console.log('\n🏢 Verificação de conexões padrão por empresa:');
    const [companies] = await sequelize.query(`
      SELECT DISTINCT "companyId" FROM "Whatsapps" ORDER BY "companyId"
    `);

    for (const company of companies) {
      const [defaultWa] = await sequelize.query(`
        SELECT id, name, status FROM "Whatsapps" 
        WHERE "companyId" = ${company.companyId} AND "isDefault" = true
      `);

      console.log(`\nEmpresa ${company.companyId}:`);
      if (defaultWa.length === 0) {
        console.log('   ❌ Nenhuma conexão padrão definida');
        console.log('   Solução: Defina uma conexão como padrão na seção "Conexões"');
      } else {
        const wa = defaultWa[0];
        console.log(`   ✅ Conexão padrão: ${wa.name} (Status: ${wa.status})`);
        if (wa.status !== 'CONNECTED') {
          console.log('   ⚠️  Conexão padrão não está conectada');
        }
      }
    }

    // Instruções para teste
    console.log('\n📋 Para testar a API:');
    console.log('1. Certifique-se de que pelo menos uma conexão WhatsApp está CONECTADA');
    console.log('2. Defina uma conexão como PADRÃO (isDefault = true)');
    console.log('3. Use o token da conexão no header Authorization');
    console.log('4. Teste com um número válido no formato: 5511999999999');

    // Exemplo de teste
    const connectedWa = whatsapps.find(wa => wa.status === 'CONNECTED' && wa.token);
    if (connectedWa) {
      console.log('\n🧪 Exemplo de teste com cURL:');
      console.log(`curl -X POST "http://localhost:8080/api/messages/send" \\`);
      console.log(`  -H "Content-Type: application/json" \\`);
      console.log(`  -H "Authorization: Bearer ${connectedWa.token}" \\`);
      console.log(`  -d '{`);
      console.log(`    "number": "5511999999999",`);
      console.log(`    "body": "Mensagem de teste"`);
      console.log(`  }'`);
    }

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error.message);
  } finally {
    await sequelize.close();
  }
}

diagnoseAPI();