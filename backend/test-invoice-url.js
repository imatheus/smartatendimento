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

async function testInvoiceUrls() {
  try {
    console.log('🧪 Testando URLs das faturas...\n');

    // Buscar todas as faturas com seus URLs
    const invoices = await sequelize.query(
      `SELECT 
        i.id, 
        i.detail, 
        i.value, 
        i.status, 
        i."companyId", 
        i."asaasInvoiceId",
        i."invoiceUrl",
        i."dueDate",
        c.name as company_name
      FROM "Invoices" i 
      LEFT JOIN "Companies" c ON i."companyId" = c.id 
      ORDER BY i.id`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log(`📋 Total de faturas encontradas: ${invoices.length}\n`);

    invoices.forEach((invoice, index) => {
      console.log(`--- Fatura ${index + 1} ---`);
      console.log(`ID: ${invoice.id}`);
      console.log(`Empresa: ${invoice.company_name} (ID: ${invoice.companyId})`);
      console.log(`Descrição: ${invoice.detail}`);
      console.log(`Valor: R$ ${invoice.value.toFixed(2)}`);
      console.log(`Status: ${invoice.status}`);
      console.log(`Vencimento: ${new Date(invoice.dueDate).toLocaleDateString('pt-BR')}`);
      console.log(`Asaas ID: ${invoice.asaasInvoiceId}`);
      console.log(`URL da Fatura: ${invoice.invoiceUrl || 'NÃO DEFINIDA'}`);
      
      // Verificar se a URL está no formato correto
      if (invoice.invoiceUrl) {
        const isValidUrl = invoice.invoiceUrl.includes('asaas.com/i/');
        console.log(`✅ URL válida: ${isValidUrl ? 'SIM' : 'NÃO'}`);
        
        if (isValidUrl) {
          console.log(`🔗 Link direto: ${invoice.invoiceUrl}`);
        }
      } else {
        console.log('❌ URL não encontrada - fatura não pode ser paga diretamente');
      }
      
      console.log(''); // Linha em branco
    });

    // Estatísticas
    const withUrl = invoices.filter(inv => inv.invoiceUrl).length;
    const withoutUrl = invoices.length - withUrl;
    
    console.log('📊 Estatísticas:');
    console.log(`✅ Faturas com URL: ${withUrl}`);
    console.log(`❌ Faturas sem URL: ${withoutUrl}`);
    console.log(`📈 Percentual com URL: ${((withUrl / invoices.length) * 100).toFixed(1)}%`);

    if (withoutUrl > 0) {
      console.log('\n⚠️ ATENÇÃO: Algumas faturas não possuem URL do Asaas!');
      console.log('Isso pode acontecer se:');
      console.log('1. A fatura foi criada antes da implementação do webhook');
      console.log('2. Houve erro no processamento do webhook');
      console.log('3. A fatura foi criada manualmente no banco');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sequelize.close();
  }
}

testInvoiceUrls();