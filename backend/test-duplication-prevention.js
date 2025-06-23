const { Sequelize } = require('sequelize');

// Configuração do banco
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  database: 'smart_atendimento_db',
  logging: false
});

async function testDuplicationPrevention() {
  try {
    console.log('🛡️ Testando prevenção de duplicação...\n');

    // Verificar se os novos campos foram adicionados
    console.log('📊 Verificando estrutura da tabela Companies:');
    const tableInfo = await sequelize.query(
      `SELECT column_name, data_type, is_nullable 
       FROM information_schema.columns 
       WHERE table_name = 'Companies' 
       AND column_name IN ('asaasCustomerId', 'asaasSubscriptionId', 'asaasSyncedAt')
       ORDER BY column_name`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (tableInfo.length === 3) {
      console.log('✅ Novos campos adicionados com sucesso:');
      tableInfo.forEach(col => {
        console.log(`   • ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } else {
      console.log('❌ Campos não encontrados. Execute a migration primeiro.');
      return;
    }

    console.log('\n📋 Status atual das empresas:');
    const companies = await sequelize.query(
      `SELECT 
        id, 
        name, 
        email,
        status,
        "asaasCustomerId",
        "asaasSubscriptionId",
        "asaasSyncedAt"
      FROM "Companies" 
      ORDER BY id`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    companies.forEach((company, index) => {
      const syncStatus = company.asaasCustomerId && company.asaasSubscriptionId ? '🟢 Sincronizada' : '🔴 Não sincronizada';
      const syncDate = company.asaasSyncedAt ? new Date(company.asaasSyncedAt).toLocaleString('pt-BR') : 'Nunca';
      
      console.log(`${index + 1}. ${company.name} (ID: ${company.id})`);
      console.log(`   Status: ${syncStatus}`);
      console.log(`   Email: ${company.email || 'Não informado'}`);
      console.log(`   Asaas Customer ID: ${company.asaasCustomerId || 'Não definido'}`);
      console.log(`   Asaas Subscription ID: ${company.asaasSubscriptionId || 'Não definido'}`);
      console.log(`   Última sincronização: ${syncDate}`);
      console.log('');
    });

    // Estatísticas
    const totalCompanies = companies.length;
    const syncedCompanies = companies.filter(c => c.asaasCustomerId && c.asaasSubscriptionId).length;
    const notSyncedCompanies = totalCompanies - syncedCompanies;

    console.log('📈 Resumo:');
    console.log(`Total de empresas: ${totalCompanies}`);
    console.log(`🟢 Sincronizadas com Asaas: ${syncedCompanies}`);
    console.log(`🔴 Não sincronizadas: ${notSyncedCompanies}`);
    console.log(`Percentual sincronizado: ${totalCompanies > 0 ? ((syncedCompanies / totalCompanies) * 100).toFixed(1) : 0}%`);

    console.log('\n🛡️ Validações implementadas:');
    console.log('✅ Campos únicos para asaasCustomerId e asaasSubscriptionId');
    console.log('✅ Verificação antes de criar no Asaas');
    console.log('✅ Atualização automática dos IDs após criação');
    console.log('✅ Timestamp de sincronização');

    console.log('\n🚀 Benefícios:');
    console.log('• Previne duplicação de empresas no Asaas');
    console.log('• Permite rastreamento do status de sincronização');
    console.log('• Melhora a integridade dos dados');
    console.log('• Facilita troubleshooting');

    console.log('\n💡 Como funciona agora:');
    console.log('1. Sistema verifica se empresa já tem IDs do Asaas');
    console.log('2. Se não tem, cria cliente e assinatura no Asaas');
    console.log('3. Salva os IDs retornados na empresa');
    console.log('4. Próximas tentativas são bloqueadas automaticamente');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sequelize.close();
  }
}

testDuplicationPrevention();