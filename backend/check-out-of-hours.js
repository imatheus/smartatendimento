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

async function checkOutOfHours() {
  try {
    console.log('🔍 Verificando configurações de horário de funcionamento...\n');

    // Verificar mensagens de fora do expediente
    const [queues] = await sequelize.query(`
      SELECT id, name, "outOfHoursMessage", schedules 
      FROM "Queues" 
      WHERE "companyId" = 1
    `);
    
    console.log(`🏢 Setores encontrados: ${queues.length}`);
    queues.forEach(queue => {
      console.log(`\n📋 Setor: ${queue.name} (ID: ${queue.id})`);
      console.log(`   Mensagem fora do expediente: "${queue.outOfHoursMessage || 'Não configurada'}"`);
      console.log(`   Horários: ${queue.schedules ? JSON.stringify(queue.schedules) : 'Não configurados'}`);
    });

    // Verificar se há mensagem "Tudo bem?" sendo enviada
    const problematicQueue = queues.find(q => 
      q.outOfHoursMessage && q.outOfHoursMessage.includes('Tudo bem')
    );

    if (problematicQueue) {
      console.log(`\n⚠️  PROBLEMA ENCONTRADO!`);
      console.log(`Setor "${problematicQueue.name}" tem mensagem problemática: "${problematicQueue.outOfHoursMessage}"`);
      
      console.log('\n🔧 Removendo mensagem problemática...');
      await sequelize.query(`
        UPDATE "Queues" 
        SET "outOfHoursMessage" = NULL, "updatedAt" = NOW()
        WHERE id = ${problematicQueue.id}
      `);
      console.log('✅ Mensagem removida!');
    }

    // Verificar novamente
    const [updatedQueues] = await sequelize.query(`
      SELECT id, name, "outOfHoursMessage" 
      FROM "Queues" 
      WHERE "companyId" = 1
    `);
    
    console.log('\n📊 Estado final:');
    updatedQueues.forEach(queue => {
      console.log(`   - ${queue.name}: "${queue.outOfHoursMessage || 'Sem mensagem de fora do expediente'}"`)
    });

    console.log('\n✅ Verificação concluída!');
    console.log('💡 Agora teste novamente o fluxo do chatbot');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar
checkOutOfHours();