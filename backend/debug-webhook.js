const { Sequelize } = require('sequelize');

// Configuração do banco (ajuste conforme seu .env)
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  database: 'smart_atendimento_db',
  logging: console.log
});

async function debugWebhook() {
  try {
    console.log('🔍 Verificando dados do webhook...\n');

    // 1. Verificar empresas existentes
    console.log('📊 Empresas no banco:');
    const companies = await sequelize.query(
      'SELECT id, name, status FROM "Companies" ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );
    console.table(companies);

    // 2. Verificar faturas existentes
    console.log('\n📋 Faturas no banco:');
    const invoices = await sequelize.query(
      `SELECT 
        i.id, 
        i.detail, 
        i.value, 
        i.status, 
        i."companyId", 
        i."asaasInvoiceId",
        i."invoiceUrl",
        i."createdAt",
        c.name as company_name
      FROM "Invoices" i 
      LEFT JOIN "Companies" c ON i."companyId" = c.id 
      ORDER BY i."createdAt" DESC 
      LIMIT 10`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    console.table(invoices);

    // 3. Verificar usuários e suas empresas
    console.log('\n👥 Usuários e suas empresas:');
    const users = await sequelize.query(
      `SELECT 
        u.id, 
        u.name, 
        u.email, 
        u."companyId",
        c.name as company_name
      FROM "Users" u 
      LEFT JOIN "Companies" c ON u."companyId" = c.id 
      ORDER BY u.id`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    console.table(users);

    // 4. Verificar configuração do Asaas
    console.log('\n⚙️ Configuração do Asaas:');
    const asaasConfig = await sequelize.query(
      'SELECT * FROM "AsaasConfigs" LIMIT 1',
      { type: Sequelize.QueryTypes.SELECT }
    );
    console.table(asaasConfig);

    // 5. Simular lógica do webhook
    console.log('\n🧪 Simulando lógica do webhook:');
    
    // Teste com externalReference
    const testExternalRef = "company_1_test_123";
    const match = testExternalRef.match(/company_(\d+)_/);
    if (match) {
      const companyId = parseInt(match[1]);
      console.log(`✅ ExternalReference "${testExternalRef}" -> Company ID: ${companyId}`);
      
      const company = companies.find(c => c.id === companyId);
      if (company) {
        console.log(`✅ Empresa encontrada: ${company.name} (Status: ${company.status})`);
      } else {
        console.log(`❌ Empresa com ID ${companyId} não encontrada`);
      }
    } else {
      console.log(`❌ ExternalReference "${testExternalRef}" não corresponde ao padrão`);
    }

    // Teste sem externalReference (fallback)
    console.log('\n🔄 Testando fallback (primeira empresa ativa):');
    const activeCompany = companies.find(c => c.status === true);
    if (activeCompany) {
      console.log(`✅ Empresa ativa encontrada: ${activeCompany.name} (ID: ${activeCompany.id})`);
    } else {
      console.log('❌ Nenhuma empresa ativa encontrada');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sequelize.close();
  }
}

debugWebhook();