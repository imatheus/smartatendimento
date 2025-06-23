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

async function checkInvoiceStatus() {
  try {
    console.log('📊 Status atual das faturas:\n');

    const invoices = await sequelize.query(
      `SELECT 
        i.id, 
        i.detail, 
        i.value, 
        i.status, 
        i."companyId", 
        i."asaasInvoiceId",
        i."invoiceUrl",
        i."paymentDate",
        i."paymentMethod",
        i."dueDate",
        i."createdAt",
        i."updatedAt",
        c.name as company_name
      FROM "Invoices" i 
      LEFT JOIN "Companies" c ON i."companyId" = c.id 
      ORDER BY i.id`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    invoices.forEach((invoice, index) => {
      console.log(`--- Fatura ${index + 1} ---`);
      console.log(`ID: ${invoice.id}`);
      console.log(`Empresa: ${invoice.company_name} (ID: ${invoice.companyId})`);
      console.log(`Descrição: ${invoice.detail}`);
      console.log(`Valor: R$ ${invoice.value.toFixed(2)}`);
      console.log(`Status: ${invoice.status}`);
      console.log(`Asaas ID: ${invoice.asaasInvoiceId}`);
      console.log(`URL: ${invoice.invoiceUrl}`);
      console.log(`Data Pagamento: ${invoice.paymentDate || 'Não pago'}`);
      console.log(`Método Pagamento: ${invoice.paymentMethod || 'N/A'}`);
      console.log(`Vencimento: ${new Date(invoice.dueDate).toLocaleDateString('pt-BR')}`);
      console.log(`Criado em: ${new Date(invoice.createdAt).toLocaleString('pt-BR')}`);
      console.log(`Atualizado em: ${new Date(invoice.updatedAt).toLocaleString('pt-BR')}`);
      
      // Status visual
      const isPaid = ['paid', 'CONFIRMED', 'RECEIVED'].includes(invoice.status);
      console.log(`Status Visual: ${isPaid ? '🟢 PAGO' : '🔴 PENDENTE'}`);
      
      console.log(''); // Linha em branco
    });

    // Estatísticas
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => 
      ['paid', 'CONFIRMED', 'RECEIVED'].includes(inv.status)
    ).length;
    const pendingInvoices = totalInvoices - paidInvoices;

    console.log('📈 Resumo:');
    console.log(`Total de faturas: ${totalInvoices}`);
    console.log(`🟢 Pagas: ${paidInvoices}`);
    console.log(`🔴 Pendentes: ${pendingInvoices}`);
    console.log(`Percentual pago: ${totalInvoices > 0 ? ((paidInvoices / totalInvoices) * 100).toFixed(1) : 0}%`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sequelize.close();
  }
}

checkInvoiceStatus();