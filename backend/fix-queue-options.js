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

async function fixQueueOptions() {
  try {
    console.log('🔧 Corrigindo opções de chatbot...\n');

    // 1. Limpar opções mal configuradas do setor Financeiro
    await sequelize.query(`
      DELETE FROM "QueueOptions" WHERE "queueId" = 2
    `);
    console.log('🗑️  Opções antigas do setor Financeiro removidas');

    // 2. Criar opções corretas para o setor Financeiro
    const financialOptions = [
      { option: '1', title: '2ª Via de Boleto', message: 'Você escolheu 2ª Via de Boleto. Em breve um atendente entrará em contato para ajudá-lo.' },
      { option: '2', title: 'Atraso no Pagamento', message: 'Você escolheu Atraso no Pagamento. Em breve um atendente entrará em contato para negociar.' },
      { option: '3', title: 'Negociação de Débitos', message: 'Você escolheu Negociação de Débitos. Em breve um atendente entrará em contato.' }
    ];

    for (const optionData of financialOptions) {
      await sequelize.query(`
        INSERT INTO "QueueOptions" ("queueId", "parentId", "title", "message", "option", "createdAt", "updatedAt")
        VALUES (2, NULL, '${optionData.title}', '${optionData.message}', '${optionData.option}', NOW(), NOW())
      `);
      console.log(`✅ Opção criada para Financeiro: [${optionData.option}] - ${optionData.title}`);
    }

    // 3. Atualizar mensagens de saudação dos setores
    await sequelize.query(`
      UPDATE "Queues" 
      SET "greetingMessage" = 'Olá! Você está no setor Financeiro. Escolha uma das opções abaixo:', "updatedAt" = NOW()
      WHERE id = 2
    `);
    console.log('✅ Mensagem de saudação do setor Financeiro atualizada');

    await sequelize.query(`
      UPDATE "Queues" 
      SET "greetingMessage" = 'Olá! Você está no setor de Teste. Escolha uma das opções abaixo:', "updatedAt" = NOW()
      WHERE id = 3
    `);
    console.log('✅ Mensagem de saudação do setor Teste atualizada');

    // 4. Verificar resultado final
    console.log('\n📊 Verificação final:');
    
    const [queues] = await sequelize.query(`
      SELECT id, name, "greetingMessage" FROM "Queues" WHERE "companyId" = 1
    `);

    for (const queue of queues) {
      const [options] = await sequelize.query(`
        SELECT id, title, option, message 
        FROM "QueueOptions" 
        WHERE "queueId" = ${queue.id} AND "parentId" IS NULL
        ORDER BY "option"
      `);
      
      console.log(`\n🏢 Setor: ${queue.name} (${options.length} opções)`);
      console.log(`   Saudação: "${queue.greetingMessage}"`);
      options.forEach(option => {
        console.log(`   [${option.option}] - ${option.title}`);
      });
    }

    console.log('\n✅ Correção concluída! Agora teste o chatbot novamente.');
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar a correção
fixQueueOptions();