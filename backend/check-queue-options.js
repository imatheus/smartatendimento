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

async function checkAndCreateQueueOptions() {
  try {
    console.log('🔍 Verificando opções de chatbot para os setores...\n');

    // 1. Verificar setores existentes
    const [queues] = await sequelize.query(`
      SELECT id, name, "greetingMessage" FROM "Queues" WHERE "companyId" = 1
    `);
    
    console.log(`🏢 Setores encontrados: ${queues.length}`);
    queues.forEach(queue => {
      console.log(`   - ID: ${queue.id}, Nome: ${queue.name}`);
    });
    console.log('');

    // 2. Verificar opções existentes para cada setor
    for (const queue of queues) {
      const [options] = await sequelize.query(`
        SELECT id, title, option, message, "parentId" 
        FROM "QueueOptions" 
        WHERE "queueId" = ${queue.id} AND "parentId" IS NULL
        ORDER BY "option"
      `);
      
      console.log(`📋 Opções para o setor "${queue.name}": ${options.length}`);
      options.forEach(option => {
        console.log(`   - Opção: ${option.option}, Título: ${option.title}`);
      });

      // 3. Se não há opções, criar algumas de exemplo
      if (options.length === 0) {
        console.log(`⚠️  Setor "${queue.name}" não tem opções de chatbot!`);
        console.log(`🔧 Criando opções de exemplo...\n`);

        // Criar opções baseadas no nome do setor
        let optionsToCreate = [];
        
        if (queue.name.toLowerCase().includes('financeiro')) {
          optionsToCreate = [
            { option: '1', title: '2ª Via de Boleto', message: 'Você escolheu 2ª Via de Boleto. Em breve um atendente entrará em contato.' },
            { option: '2', title: 'Atraso no Pagamento', message: 'Você escolheu Atraso no Pagamento. Em breve um atendente entrará em contato.' },
            { option: '3', title: 'Negociação de Débitos', message: 'Você escolheu Negociação de Débitos. Em breve um atendente entrará em contato.' }
          ];
        } else if (queue.name.toLowerCase().includes('teste')) {
          optionsToCreate = [
            { option: '1', title: 'Suporte Técnico', message: 'Você escolheu Suporte Técnico. Em breve um atendente entrará em contato.' },
            { option: '2', title: 'Informações Gerais', message: 'Você escolheu Informações Gerais. Em breve um atendente entrará em contato.' }
          ];
        } else {
          // Opções genéricas
          optionsToCreate = [
            { option: '1', title: 'Informações', message: 'Você escolheu Informações. Em breve um atendente entrará em contato.' },
            { option: '2', title: 'Suporte', message: 'Você escolheu Suporte. Em breve um atendente entrará em contato.' }
          ];
        }

        for (const optionData of optionsToCreate) {
          await sequelize.query(`
            INSERT INTO "QueueOptions" ("queueId", "parentId", "title", "message", "option", "createdAt", "updatedAt")
            VALUES (${queue.id}, NULL, '${optionData.title}', '${optionData.message}', '${optionData.option}', NOW(), NOW())
          `);
          console.log(`✅ Opção criada: [${optionData.option}] - ${optionData.title}`);
        }
        console.log('');
      }

      // 4. Atualizar mensagem de saudação do setor se estiver vazia
      if (!queue.greetingMessage || queue.greetingMessage.trim() === '') {
        const greetingMessage = `Olá! Você está no setor ${queue.name}. Escolha uma das opções abaixo:`;
        await sequelize.query(`
          UPDATE "Queues" 
          SET "greetingMessage" = '${greetingMessage}', "updatedAt" = NOW()
          WHERE id = ${queue.id}
        `);
        console.log(`✅ Mensagem de saudação atualizada para o setor "${queue.name}"`);
      }
    }

    // 5. Verificar novamente as opções após criação
    console.log('\n📊 Verificação final das opções:');
    for (const queue of queues) {
      const [finalOptions] = await sequelize.query(`
        SELECT id, title, option, message 
        FROM "QueueOptions" 
        WHERE "queueId" = ${queue.id} AND "parentId" IS NULL
        ORDER BY "option"
      `);
      
      console.log(`\n🏢 Setor: ${queue.name} (${finalOptions.length} opções)`);
      finalOptions.forEach(option => {
        console.log(`   [${option.option}] - ${option.title}`);
      });
    }

    console.log('\n✅ Verificação e criação de opções concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar a verificação
checkAndCreateQueueOptions();