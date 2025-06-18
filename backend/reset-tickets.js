const { Sequelize } = require('sequelize');

// Configuração do banco de dados
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'smart_atendimento_db',
  username: 'postgres',
  password: 'root',
  logging: console.log
});

async function resetTickets() {
  try {
    console.log('🔄 Resetando tickets para teste...\n');

    // 1. Verificar tickets existentes
    const [existingTickets] = await sequelize.query(`
      SELECT id, "contactId", "queueId", chatbot, "queueOptionId", status
      FROM "Tickets" 
      WHERE "companyId" = 1
      ORDER BY id DESC
      LIMIT 10
    `);
    
    console.log(`📋 Tickets existentes (últimos 10): ${existingTickets.length}`);
    existingTickets.forEach(ticket => {
      console.log(`   - ID: ${ticket.id}, Contact: ${ticket.contactId}, Queue: ${ticket.queueId}, Chatbot: ${ticket.chatbot}, Status: ${ticket.status}`);
    });

    // 2. Resetar tickets para teste (remover setor e chatbot)
    if (existingTickets.length > 0) {
      console.log('\n🔧 Resetando tickets para permitir novo teste...');
      
      await sequelize.query(`
        UPDATE "Tickets" 
        SET "queueId" = NULL, 
            chatbot = false, 
            "queueOptionId" = NULL,
            status = 'pending'
        WHERE "companyId" = 1 
        AND status != 'closed'
      `);
      
      console.log('✅ Tickets resetados com sucesso!');
    }

    // 3. Verificar estrutura atual do sistema
    console.log('\n📊 Estrutura atual do sistema:');
    
    const [whatsapps] = await sequelize.query(`
      SELECT id, name FROM "Whatsapps" WHERE "companyId" = 1
    `);
    
    const [queues] = await sequelize.query(`
      SELECT id, name FROM "Queues" WHERE "companyId" = 1
    `);
    
    const [associations] = await sequelize.query(`
      SELECT COUNT(*) as count FROM "WhatsappQueues" wq
      LEFT JOIN "Whatsapps" w ON w.id = wq."whatsappId"
      WHERE w."companyId" = 1
    `);
    
    const [options] = await sequelize.query(`
      SELECT COUNT(*) as count FROM "QueueOptions" qo
      LEFT JOIN "Queues" q ON q.id = qo."queueId"
      WHERE q."companyId" = 1 AND qo."parentId" IS NULL
    `);

    console.log(`📱 WhatsApps: ${whatsapps.length}`);
    console.log(`🏢 Setores: ${queues.length}`);
    console.log(`🔗 Associações: ${associations[0].count}`);
    console.log(`���� Opções de chatbot: ${options[0].count}`);

    console.log('\n✅ Reset concluído! Agora você pode testar o fluxo completo:');
    console.log('1. Envie uma mensagem para o WhatsApp');
    console.log('2. O sistema deve mostrar as opções de setores');
    console.log('3. Escolha "1" para Financeiro');
    console.log('4. O sistema deve mostrar as opções do setor Financeiro');
    console.log('5. Escolha uma opção (1, 2 ou 3)');
    console.log('6. Use "#" para voltar ao menu principal');
    
  } catch (error) {
    console.error('❌ Erro durante o reset:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar o reset
resetTickets();