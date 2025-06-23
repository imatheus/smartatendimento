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

async function debugOverdueWebhook() {
  try {
    console.log('🔍 Debugando webhook PAYMENT_OVERDUE...\n');

    // ID do pagamento do webhook que você recebeu
    const asaasPaymentId = 'pay_49jucioh5v3tw85o';
    
    console.log(`📋 Procurando fatura com asaasInvoiceId: ${asaasPaymentId}`);

    // Buscar a fatura no banco
    const invoice = await sequelize.query(
      `SELECT 
        i.id, 
        i.detail, 
        i.value, 
        i.status, 
        i."companyId", 
        i."asaasInvoiceId",
        i."dueDate",
        i."createdAt",
        i."updatedAt",
        c.name as company_name
      FROM "Invoices" i 
      LEFT JOIN "Companies" c ON i."companyId" = c.id 
      WHERE i."asaasInvoiceId" = :asaasPaymentId`,
      { 
        replacements: { asaasPaymentId },
        type: Sequelize.QueryTypes.SELECT 
      }
    );

    if (invoice.length > 0) {
      console.log('✅ Fatura encontrada no banco:');
      console.table(invoice[0]);
      
      const invoiceData = invoice[0];
      console.log('\n📊 Detalhes da fatura:');
      console.log(`ID: ${invoiceData.id}`);
      console.log(`Empresa: ${invoiceData.company_name} (ID: ${invoiceData.companyId})`);
      console.log(`Status atual: ${invoiceData.status}`);
      console.log(`Vencimento: ${new Date(invoiceData.dueDate).toLocaleDateString('pt-BR')}`);
      console.log(`Última atualização: ${new Date(invoiceData.updatedAt).toLocaleString('pt-BR')}`);
      
      // Verificar se o status deveria ser "OVERDUE"
      const hoje = new Date();
      const vencimento = new Date(invoiceData.dueDate);
      const isOverdue = hoje > vencimento;
      
      console.log('\n🗓️ Análise de vencimento:');
      console.log(`Data atual: ${hoje.toLocaleDateString('pt-BR')}`);
      console.log(`Data vencimento: ${vencimento.toLocaleDateString('pt-BR')}`);
      console.log(`Está vencida: ${isOverdue ? 'SIM' : 'NÃO'}`);
      console.log(`Status esperado: ${isOverdue ? 'OVERDUE' : 'PENDING'}`);
      console.log(`Status no banco: ${invoiceData.status}`);
      
      if (invoiceData.status !== 'OVERDUE' && isOverdue) {
        console.log('\n⚠️ PROBLEMA IDENTIFICADO:');
        console.log('A fatura deveria estar com status OVERDUE mas não está!');
        console.log('Isso indica que o webhook não atualizou o status corretamente.');
      } else if (invoiceData.status === 'OVERDUE') {
        console.log('\n✅ Status correto no banco!');
        console.log('O webhook atualizou o status corretamente.');
        console.log('O problema pode estar na atualização do frontend.');
      }
      
    } else {
      console.log('❌ Fatura NÃO encontrada no banco!');
      console.log('\n🔍 Possíveis causas:');
      console.log('1. A fatura não foi criada via webhook PAYMENT_CREATED');
      console.log('2. O asaasInvoiceId não corresponde');
      console.log('3. Houve erro na criação inicial da fatura');
      
      // Buscar faturas similares
      console.log('\n📋 Buscando faturas similares...');
      const similarInvoices = await sequelize.query(
        `SELECT 
          i.id, 
          i.detail, 
          i."asaasInvoiceId",
          i.status,
          c.name as company_name
        FROM "Invoices" i 
        LEFT JOIN "Companies" c ON i."companyId" = c.id 
        WHERE i.detail LIKE '%Matheus%' 
        OR i."asaasInvoiceId" LIKE '%49jucioh5v3tw85o%'
        ORDER BY i."createdAt" DESC 
        LIMIT 5`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      
      if (similarInvoices.length > 0) {
        console.log('📋 Faturas similares encontradas:');
        console.table(similarInvoices);
      } else {
        console.log('❌ Nenhuma fatura similar encontrada');
      }
    }

    // Verificar todas as faturas da empresa 13
    console.log('\n📋 Todas as faturas da empresa 13:');
    const companyInvoices = await sequelize.query(
      `SELECT 
        i.id, 
        i.detail, 
        i.value, 
        i.status, 
        i."asaasInvoiceId",
        i."dueDate"
      FROM "Invoices" i 
      WHERE i."companyId" = 13
      ORDER BY i."createdAt" DESC`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (companyInvoices.length > 0) {
      console.table(companyInvoices);
    } else {
      console.log('❌ Nenhuma fatura encontrada para a empresa 13');
      
      // Verificar se a empresa 13 existe
      const company = await sequelize.query(
        'SELECT id, name FROM "Companies" WHERE id = 13',
        { type: Sequelize.QueryTypes.SELECT }
      );
      
      if (company.length > 0) {
        console.log(`✅ Empresa 13 existe: ${company[0].name}`);
      } else {
        console.log('❌ Empresa 13 não existe no banco!');
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sequelize.close();
  }
}

debugOverdueWebhook();