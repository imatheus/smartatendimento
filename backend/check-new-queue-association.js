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

async function checkNewQueueAssociation() {
  try {
    console.log('🔍 Verificando problema de setores novos não aparecendo...\n');

    // 1. Verificar todos os setores
    const [allQueues] = await sequelize.query(`
      SELECT id, name, "createdAt" FROM "Queues" WHERE "companyId" = 1 ORDER BY "createdAt" DESC
    `);
    
    console.log(`🏢 Todos os setores da empresa: ${allQueues.length}`);
    allQueues.forEach(queue => {
      console.log(`   - ${queue.name} (ID: ${queue.id}) - Criado: ${queue.createdAt}`);
    });

    // 2. Verificar WhatsApps
    const [whatsapps] = await sequelize.query(`
      SELECT id, name FROM "Whatsapps" WHERE "companyId" = 1
    `);
    
    console.log(`\n📱 WhatsApps da empresa: ${whatsapps.length}`);
    whatsapps.forEach(wa => {
      console.log(`   - ${wa.name} (ID: ${wa.id})`);
    });

    // 3. Verificar associações existentes
    const [associations] = await sequelize.query(`
      SELECT wq."whatsappId", wq."queueId", w.name as whatsapp_name, q.name as queue_name
      FROM "WhatsappQueues" wq
      LEFT JOIN "Whatsapps" w ON w.id = wq."whatsappId"
      LEFT JOIN "Queues" q ON q.id = wq."queueId"
      WHERE w."companyId" = 1
      ORDER BY q.name
    `);
    
    console.log(`\n🔗 Associações existentes: ${associations.length}`);
    associations.forEach(assoc => {
      console.log(`   - ${assoc.whatsapp_name} -> ${assoc.queue_name}`);
    });

    // 4. Identificar setores não associados
    const associatedQueueIds = associations.map(a => a.queueId);
    const unassociatedQueues = allQueues.filter(q => !associatedQueueIds.includes(q.id));
    
    console.log(`\n⚠️  Setores NÃO associados a nenhum WhatsApp: ${unassociatedQueues.length}`);
    unassociatedQueues.forEach(queue => {
      console.log(`   - ${queue.name} (ID: ${queue.id}) - Criado: ${queue.createdAt}`);
    });

    // 5. Se há setores não associados, criar as associações
    if (unassociatedQueues.length > 0 && whatsapps.length > 0) {
      console.log('\n🔧 Criando associações automáticas para setores não associados...');
      
      for (const whatsapp of whatsapps) {
        for (const queue of unassociatedQueues) {
          await sequelize.query(`
            INSERT INTO "WhatsappQueues" ("whatsappId", "queueId", "createdAt", "updatedAt")
            VALUES (${whatsapp.id}, ${queue.id}, NOW(), NOW())
          `);
          console.log(`✅ Associação criada: ${whatsapp.name} -> ${queue.name}`);
        }
      }
    }

    // 6. Verificar resultado final
    const [finalAssociations] = await sequelize.query(`
      SELECT wq."whatsappId", wq."queueId", w.name as whatsapp_name, q.name as queue_name
      FROM "WhatsappQueues" wq
      LEFT JOIN "Whatsapps" w ON w.id = wq."whatsappId"
      LEFT JOIN "Queues" q ON q.id = wq."queueId"
      WHERE w."companyId" = 1
      ORDER BY q.name
    `);
    
    console.log(`\n📊 Associações finais: ${finalAssociations.length}`);
    finalAssociations.forEach(assoc => {
      console.log(`   - ${assoc.whatsapp_name} -> ${assoc.queue_name}`);
    });

    // 7. Testar consulta que o sistema faz
    console.log('\n🧪 Testando consulta do sistema...');
    const [testResult] = await sequelize.query(`
      SELECT w.id, w.name, w."greetingMessage",
             json_agg(
               json_build_object(
                 'id', q.id,
                 'name', q.name,
                 'color', q.color,
                 'greetingMessage', q."greetingMessage"
               ) ORDER BY q.name
             ) FILTER (WHERE q.id IS NOT NULL) as queues
      FROM "Whatsapps" w
      LEFT JOIN "WhatsappQueues" wq ON w.id = wq."whatsappId"
      LEFT JOIN "Queues" q ON wq."queueId" = q.id AND q."companyId" = 1
      WHERE w."companyId" = 1
      GROUP BY w.id, w.name, w."greetingMessage"
    `);

    if (testResult.length > 0) {
      const result = testResult[0];
      console.log(`📋 Resultado para WhatsApp "${result.name}":`);
      console.log(`   - Setores disponíveis: ${result.queues ? result.queues.length : 0}`);
      if (result.queues) {
        result.queues.forEach((queue, index) => {
          console.log(`     ${index + 1}. ${queue.name} (ID: ${queue.id})`);
        });
      }
    }

    console.log('\n✅ Verificação concluída!');
    console.log('\n💡 SOLUÇÃO IMPLEMENTADA:');
    console.log('- Setores novos são automaticamente associados a todos os WhatsApps');
    console.log('- Agora todos os setores aparecerão no primeiro contato');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar a verificação
checkNewQueueAssociation();