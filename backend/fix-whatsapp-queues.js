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

async function diagnosticAndFix() {
  try {
    console.log('🔍 Iniciando diagnóstico do problema de setores...\n');

    // 1. Verificar se há WhatsApps cadastrados
    const [whatsapps] = await sequelize.query(`
      SELECT id, name, "companyId" FROM "Whatsapps" WHERE "companyId" = 1
    `);
    
    console.log(`📱 WhatsApps encontrados: ${whatsapps.length}`);
    whatsapps.forEach(wa => {
      console.log(`   - ID: ${wa.id}, Nome: ${wa.name}, Company: ${wa.companyId}`);
    });
    console.log('');

    // 2. Verificar se há Queues (setores) cadastrados
    const [queues] = await sequelize.query(`
      SELECT id, name, "companyId" FROM "Queues" WHERE "companyId" = 1
    `);
    
    console.log(`🏢 Setores encontrados: ${queues.length}`);
    queues.forEach(queue => {
      console.log(`   - ID: ${queue.id}, Nome: ${queue.name}, Company: ${queue.companyId}`);
    });
    console.log('');

    // 3. Verificar associações na tabela WhatsappQueues
    const [associations] = await sequelize.query(`
      SELECT wq."whatsappId", wq."queueId", w.name as whatsapp_name, q.name as queue_name
      FROM "WhatsappQueues" wq
      LEFT JOIN "Whatsapps" w ON w.id = wq."whatsappId"
      LEFT JOIN "Queues" q ON q.id = wq."queueId"
      WHERE w."companyId" = 1
    `);
    
    console.log(`🔗 Associações WhatsApp-Queue encontradas: ${associations.length}`);
    associations.forEach(assoc => {
      console.log(`   - WhatsApp: ${assoc.whatsapp_name} (ID: ${assoc.whatsappId}) -> Queue: ${assoc.queue_name} (ID: ${assoc.queueId})`);
    });
    console.log('');

    // 4. Se não há associações mas há WhatsApps e Queues, criar as associações
    if (associations.length === 0 && whatsapps.length > 0 && queues.length > 0) {
      console.log('⚠️  PROBLEMA IDENTIFICADO: WhatsApps sem setores associados!');
      console.log('🔧 Criando associações automáticas...\n');

      for (const whatsapp of whatsapps) {
        for (const queue of queues) {
          // Verificar se a associação já existe
          const [existing] = await sequelize.query(`
            SELECT * FROM "WhatsappQueues" 
            WHERE "whatsappId" = ${whatsapp.id} AND "queueId" = ${queue.id}
          `);

          if (existing.length === 0) {
            await sequelize.query(`
              INSERT INTO "WhatsappQueues" ("whatsappId", "queueId", "createdAt", "updatedAt")
              VALUES (${whatsapp.id}, ${queue.id}, NOW(), NOW())
            `);
            console.log(`✅ Associação criada: ${whatsapp.name} -> ${queue.name}`);
          }
        }
      }
    }

    // 5. Verificar novamente as associações após a correção
    const [newAssociations] = await sequelize.query(`
      SELECT wq."whatsappId", wq."queueId", w.name as whatsapp_name, q.name as queue_name
      FROM "WhatsappQueues" wq
      LEFT JOIN "Whatsapps" w ON w.id = wq."whatsappId"
      LEFT JOIN "Queues" q ON q.id = wq."queueId"
      WHERE w."companyId" = 1
    `);
    
    console.log(`\n🔗 Associações após correção: ${newAssociations.length}`);
    newAssociations.forEach(assoc => {
      console.log(`   - WhatsApp: ${assoc.whatsapp_name} (ID: ${assoc.whatsappId}) -> Queue: ${assoc.queue_name} (ID: ${assoc.queueId})`);
    });

    // 6. Testar a consulta que o sistema faz
    console.log('\n🧪 Testando consulta do sistema...');
    const [testResult] = await sequelize.query(`
      SELECT w.id, w.name, w."greetingMessage",
             json_agg(
               json_build_object(
                 'id', q.id,
                 'name', q.name,
                 'color', q.color,
                 'greetingMessage', q."greetingMessage"
               )
             ) as queues
      FROM "Whatsapps" w
      LEFT JOIN "WhatsappQueues" wq ON w.id = wq."whatsappId"
      LEFT JOIN "Queues" q ON wq."queueId" = q.id
      WHERE w."companyId" = 1 AND w.id = ${whatsapps[0]?.id || 1}
      GROUP BY w.id, w.name, w."greetingMessage"
    `);

    if (testResult.length > 0) {
      const result = testResult[0];
      console.log(`📊 Resultado do teste para WhatsApp ID ${result.id}:`);
      console.log(`   - Nome: ${result.name}`);
      console.log(`   - Setores: ${result.queues ? result.queues.filter(q => q.id !== null).length : 0}`);
      if (result.queues) {
        result.queues.filter(q => q.id !== null).forEach(queue => {
          console.log(`     * ${queue.name} (ID: ${queue.id})`);
        });
      }
    }

    console.log('\n✅ Diagnóstico concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar o diagnóstico
diagnosticAndFix();