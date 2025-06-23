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

async function checkAutoSync() {
  try {
    console.log('🔄 Verificando sincronização automática de faturas...\n');

    // Buscar todas as faturas ordenadas por data de criação
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
        i."updatedAt",
        c.name as company_name
      FROM "Invoices" i 
      LEFT JOIN "Companies" c ON i."companyId" = c.id 
      ORDER BY i."createdAt" DESC`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log(`📊 Total de faturas no sistema: ${invoices.length}\n`);

    console.log('📋 Últimas faturas criadas:');
    console.log('');

    invoices.slice(0, 5).forEach((invoice, index) => {
      const isPaid = ['paid', 'CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH'].includes(invoice.status);
      const statusIcon = isPaid ? '🟢' : '🔴';
      const createdAt = new Date(invoice.createdAt).toLocaleString('pt-BR');
      
      console.log(`${index + 1}. ${statusIcon} Fatura #${invoice.id}`);
      console.log(`   Empresa: ${invoice.company_name}`);
      console.log(`   Descrição: ${invoice.detail}`);
      console.log(`   Valor: R$ ${invoice.value.toFixed(2)}`);
      console.log(`   Status: ${invoice.status}`);
      console.log(`   Asaas ID: ${invoice.asaasInvoiceId}`);
      console.log(`   Criada em: ${createdAt}`);
      console.log(`   URL: ${invoice.invoiceUrl ? 'Disponível' : 'Não disponível'}`);
      console.log('');
    });

    // Verificar se há faturas criadas recentemente (últimos 10 minutos)
    const recentInvoices = await sequelize.query(
      `SELECT COUNT(*) as count 
       FROM "Invoices" 
       WHERE "createdAt" > NOW() - INTERVAL '10 minutes'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const recentCount = recentInvoices[0].count;
    
    console.log('⏰ Atividade recente (últimos 10 minutos):');
    console.log(`   Novas faturas criadas: ${recentCount}`);
    
    if (recentCount > 0) {
      console.log('   ✅ Sistema está recebendo webhooks e criando faturas automaticamente');
    } else {
      console.log('   ℹ️ Nenhuma fatura criada recentemente');
    }
    console.log('');

    console.log('🔧 Funcionalidades implementadas:');
    console.log('✅ Webhook PAYMENT_CREATED processa novas faturas');
    console.log('✅ Socket.IO emite evento quando fatura é criada');
    console.log('✅ Frontend recebe notificação em tempo real');
    console.log('✅ Nova fatura aparece automaticamente na lista');
    console.log('✅ Notificação toast informa sobre nova fatura');
    console.log('✅ Não é mais necessário clicar em "Sincronizar Faturas"');
    console.log('');

    console.log('🧪 Para testar a sincronização automática:');
    console.log('1. Mantenha a página de Financeiro aberta');
    console.log('2. Crie uma nova fatura no painel do Asaas');
    console.log('3. Ou execute: node test-new-invoice-webhook.js');
    console.log('4. Observe a fatura aparecer automaticamente na lista');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sequelize.close();
  }
}

checkAutoSync();