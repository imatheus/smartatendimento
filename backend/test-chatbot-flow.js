const { Sequelize } = require('sequelize');

// Configuração do banco de dados
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'smart_atendimento_db',
  username: 'postgres',
  password: 'root',
  logging: false // Desabilitar logs para melhor visualização
});

async function testChatbotFlow() {
  try {
    console.log('🧪 Testando fluxo completo do chatbot...\n');

    // 1. Verificar estrutura atual
    console.log('📊 ESTRUTURA ATUAL:');
    
    const [whatsapps] = await sequelize.query(`
      SELECT w.id, w.name, w."greetingMessage"
      FROM "Whatsapps" w 
      WHERE w."companyId" = 1
    `);
    
    console.log(`\n📱 WhatsApps (${whatsapps.length}):`);
    whatsapps.forEach(wa => {
      console.log(`   - ${wa.name} (ID: ${wa.id})`);
    });

    const [queues] = await sequelize.query(`
      SELECT q.id, q.name, q."greetingMessage"
      FROM "Queues" q 
      WHERE q."companyId" = 1
      ORDER BY q.id
    `);
    
    console.log(`\n🏢 Setores (${queues.length}):`);
    for (const queue of queues) {
      const [options] = await sequelize.query(`
        SELECT id, title, option, message 
        FROM "QueueOptions" 
        WHERE "queueId" = ${queue.id} AND "parentId" IS NULL
        ORDER BY "option"
      `);
      
      console.log(`   - ${queue.name} (ID: ${queue.id}) - ${options.length} opções`);
      options.forEach(opt => {
        console.log(`     [${opt.option}] ${opt.title}`);
      });
    }

    const [associations] = await sequelize.query(`
      SELECT wq."whatsappId", wq."queueId", w.name as whatsapp_name, q.name as queue_name
      FROM "WhatsappQueues" wq
      LEFT JOIN "Whatsapps" w ON w.id = wq."whatsappId"
      LEFT JOIN "Queues" q ON q.id = wq."queueId"
      WHERE w."companyId" = 1
    `);
    
    console.log(`\n🔗 Associações WhatsApp-Queue (${associations.length}):`);
    associations.forEach(assoc => {
      console.log(`   - ${assoc.whatsapp_name} -> ${assoc.queue_name}`);
    });

    // 2. Simular fluxo do chatbot
    console.log('\n\n🎭 SIMULAÇÃO DO FLUXO:');
    console.log('═══════════════════════════════════════');
    
    // Simular primeira mensagem do usuário
    console.log('\n👤 Usuário envia primeira mensagem: "Olá"');
    console.log('🤖 Sistema deve mostrar opções de setores:');
    
    const whatsappGreeting = whatsapps[0]?.greetingMessage || 'Olá! Bem-vindo ao nosso atendimento. Escolha uma das opções abaixo:';
    console.log(`\n"${whatsappGreeting}"`);
    queues.forEach((queue, index) => {
      console.log(`*[ ${index + 1} ]* - ${queue.name}`);
    });
    
    // Simular seleção de setor
    console.log('\n👤 Usuário seleciona: "1" (Financeiro)');
    console.log('🤖 Sistema deve:');
    console.log('   1. Atribuir setor Financeiro ao ticket');
    console.log('   2. Ativar chatbot (se há opções)');
    console.log('   3. Mostrar opções do setor Financeiro:');
    
    const financialQueue = queues.find(q => q.name === 'Financeiro');
    if (financialQueue) {
      const [financialOptions] = await sequelize.query(`
        SELECT id, title, option, message 
        FROM "QueueOptions" 
        WHERE "queueId" = ${financialQueue.id} AND "parentId" IS NULL
        ORDER BY "option"
      `);
      
      console.log(`\n"${financialQueue.greetingMessage}"`);
      financialOptions.forEach(opt => {
        console.log(`*[ ${opt.option} ]* - ${opt.title}`);
      });
      console.log(`*[ # ]* - Voltar ao Menu Principal`);
      
      // Simular seleção de opção do setor
      if (financialOptions.length > 0) {
        const firstOption = financialOptions[0];
        console.log(`\n👤 Usuário seleciona: "${firstOption.option}" (${firstOption.title})`);
        console.log('🤖 Sistema deve mostrar mensagem de confirmação:');
        console.log(`\n"${firstOption.message}"`);
        console.log(`*[ # ]* - Voltar ao Menu Principal`);
      }
    }
    
    // Verificar se há problemas potenciais
    console.log('\n\n🔍 VERIFICAÇÃO DE PROBLEMAS:');
    console.log('═══════════════════════════════════════');
    
    let hasIssues = false;
    
    // Verificar se WhatsApps têm setores associados
    if (associations.length === 0) {
      console.log('❌ PROBLEMA: Nenhuma associação WhatsApp-Queue encontrada');
      hasIssues = true;
    }
    
    // Verificar se setores têm opções
    for (const queue of queues) {
      const [options] = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM "QueueOptions" 
        WHERE "queueId" = ${queue.id} AND "parentId" IS NULL
      `);
      
      if (options[0].count == 0) {
        console.log(`⚠️  AVISO: Setor "${queue.name}" não tem opções de chatbot`);
      }
    }
    
    // Verificar mensagens de saudação
    for (const queue of queues) {
      if (!queue.greetingMessage || queue.greetingMessage.trim() === '') {
        console.log(`⚠️  AVISO: Setor "${queue.name}" não tem mensagem de saudação`);
      }
    }
    
    if (!hasIssues) {
      console.log('✅ Nenhum problema crítico encontrado!');
    }
    
    console.log('\n\n📋 RESUMO:');
    console.log('═══════════════════════════════════════');
    console.log(`📱 WhatsApps configurados: ${whatsapps.length}`);
    console.log(`🏢 Setores configurados: ${queues.length}`);
    console.log(`🔗 Associações ativas: ${associations.length}`);
    
    const totalOptions = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM "QueueOptions" 
      WHERE "parentId" IS NULL
    `);
    console.log(`📋 Total de opções de chatbot: ${totalOptions[0][0].count}`);
    
    console.log('\n✅ Teste concluído! O chatbot deve estar funcionando corretamente.');
    console.log('\n💡 Para testar:');
    console.log('   1. Envie uma mensagem para o WhatsApp');
    console.log('   2. Escolha um setor (1 ou 2)');
    console.log('   3. Escolha uma opção do setor');
    console.log('   4. Use # para voltar ao menu principal');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar o teste
testChatbotFlow();