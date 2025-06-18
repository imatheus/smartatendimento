const { Sequelize } = require('sequelize');

// Configuração do banco de dados
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'smart_atendimento_db',
  username: 'postgres',
  password: 'root',
  logging: false
});

async function finalTest() {
  try {
    console.log('🧪 Teste final do sistema de setores e chatbot...\n');

    // 1. Limpar tickets problemáticos
    await sequelize.query(`
      UPDATE "Tickets" 
      SET "queueId" = NULL, 
          chatbot = false, 
          "queueOptionId" = NULL,
          status = 'pending'
      WHERE "companyId" = 1 
      AND status != 'closed'
    `);
    console.log('🧹 Tickets resetados para teste limpo');

    // 2. Verificar estrutura
    const [whatsapps] = await sequelize.query(`
      SELECT w.id, w.name, w."greetingMessage"
      FROM "Whatsapps" w 
      WHERE w."companyId" = 1
    `);

    const [queues] = await sequelize.query(`
      SELECT q.id, q.name, q."greetingMessage"
      FROM "Queues" q 
      WHERE q."companyId" = 1
    `);

    const [associations] = await sequelize.query(`
      SELECT COUNT(*) as count FROM "WhatsappQueues" wq
      LEFT JOIN "Whatsapps" w ON w.id = wq."whatsappId"
      WHERE w."companyId" = 1
    `);

    const [options] = await sequelize.query(`
      SELECT qo.id, qo.title, qo.option, q.name as queue_name
      FROM "QueueOptions" qo
      LEFT JOIN "Queues" q ON q.id = qo."queueId"
      WHERE q."companyId" = 1 AND qo."parentId" IS NULL
      ORDER BY q.name, qo.option
    `);

    console.log('\n📊 ESTRUTURA ATUAL:');
    console.log(`📱 WhatsApps: ${whatsapps.length}`);
    whatsapps.forEach(wa => {
      console.log(`   - ${wa.name} (ID: ${wa.id})`);
      console.log(`     Saudação: "${wa.greetingMessage || 'Não definida'}"`);
    });

    console.log(`\n🏢 Setores: ${queues.length}`);
    queues.forEach(queue => {
      console.log(`   - ${queue.name} (ID: ${queue.id})`);
      console.log(`     Saudação: "${queue.greetingMessage || 'Não definida'}"`);
    });

    console.log(`\n🔗 Associações WhatsApp-Queue: ${associations[0].count}`);

    console.log(`\n📋 Opções de Chatbot: ${options.length}`);
    let currentQueue = '';
    options.forEach(option => {
      if (option.queue_name !== currentQueue) {
        console.log(`\n   ${option.queue_name}:`);
        currentQueue = option.queue_name;
      }
      console.log(`     [${option.option}] ${option.title}`);
    });

    // 3. Simular fluxo esperado
    console.log('\n\n🎭 FLUXO ESPERADO:');
    console.log('═══════════════════════════════════════');
    
    console.log('\n1️⃣ PRIMEIRA MENSAGEM:');
    console.log('👤 Usuário: "Olá"');
    console.log('🤖 Sistema deve responder:');
    const greeting = whatsapps[0]?.greetingMessage || 'Olá! Bem-vindo ao nosso atendimento. Escolha uma das opções abaixo:';
    console.log(`"${greeting}"`);
    queues.forEach((queue, index) => {
      console.log(`*[ ${index + 1} ]* - ${queue.name}`);
    });

    console.log('\n2️⃣ SELEÇÃO DE SETOR:');
    console.log('👤 Usuário: "1"');
    console.log('🤖 Sistema deve:');
    console.log('   - Atribuir setor Financeiro ao ticket');
    console.log('   - Ativar chatbot');
    console.log('   - Mostrar opções do setor:');
    
    const financialQueue = queues.find(q => q.name === 'Financeiro');
    if (financialQueue) {
      console.log(`\n"${financialQueue.greetingMessage}"`);
      const financialOptions = options.filter(o => o.queue_name === 'Financeiro');
      financialOptions.forEach(opt => {
        console.log(`*[ ${opt.option} ]* - ${opt.title}`);
      });
      console.log(`*[ # ]* - Voltar ao Menu Principal`);
    }

    console.log('\n3️⃣ SELEÇÃO DE OPÇÃO:');
    console.log('👤 Usuário: "1"');
    console.log('🤖 Sistema deve mostrar confirmação da opção selecionada');

    console.log('\n4️⃣ VOLTAR AO MENU:');
    console.log('👤 Usuário: "#"');
    console.log('🤖 Sistema deve voltar às opções de setores');

    // 4. Verificar possíveis problemas
    console.log('\n\n🔍 VERIFICAÇÃO DE PROBLEMAS:');
    console.log('═══════════════════════════════════════');

    let hasIssues = false;

    if (whatsapps.length === 0) {
      console.log('❌ CRÍTICO: Nenhum WhatsApp encontrado');
      hasIssues = true;
    }

    if (queues.length === 0) {
      console.log('❌ CRÍTICO: Nenhum setor encontrado');
      hasIssues = true;
    }

    if (associations[0].count === 0) {
      console.log('❌ CRÍTICO: Nenhuma associação WhatsApp-Queue');
      hasIssues = true;
    }

    if (options.length === 0) {
      console.log('⚠️  AVISO: Nenhuma opção de chatbot configurada');
    }

    if (!hasIssues) {
      console.log('✅ Estrutura OK - Sistema pronto para teste!');
    }

    console.log('\n\n🚀 INSTRUÇÕES PARA TESTE:');
    console.log('═══════════════════════════════════════');
    console.log('1. Envie "Olá" para o WhatsApp');
    console.log('2. Aguarde as opções de setores');
    console.log('3. Digite "1" para Financeiro');
    console.log('4. Aguarde as opções do chatbot');
    console.log('5. Digite "1", "2" ou "3" para uma opção');
    console.log('6. Digite "#" para voltar ao menu');
    
    console.log('\n📝 LOGS PARA ACOMPANHAR:');
    console.log('- [DEBUG MAIN] - Fluxo principal');
    console.log('- [DEBUG QUEUE] - Seleção de setores');
    console.log('- [DEBUG CHATBOT] - Interações do chatbot');

    console.log('\n✅ Sistema preparado para teste!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar o teste
finalTest();