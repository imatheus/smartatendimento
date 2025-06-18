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

async function removeOutOfHours() {
  try {
    console.log('🔧 Removendo mensagem de fora do expediente para teste...\n');

    // Remover mensagem de fora do expediente
    await sequelize.query(`
      UPDATE "Queues" 
      SET "outOfHoursMessage" = NULL, "updatedAt" = NOW()
      WHERE "companyId" = 1
    `);
    
    console.log('✅ Mensagem de fora do expediente removida!');

    // Verificar resultado
    const [queues] = await sequelize.query(`
      SELECT id, name, "outOfHoursMessage" 
      FROM "Queues" 
      WHERE "companyId" = 1
    `);
    
    console.log('\n📊 Estado atual:');
    queues.forEach(queue => {
      console.log(`   - ${queue.name}: "${queue.outOfHoursMessage || 'Sem restrição de horário'}"`)
    });

    console.log('\n✅ Agora o chatbot funcionará 24/7 para teste!');
    console.log('💡 Teste o fluxo novamente:');
    console.log('   1. Envie "Olá"');
    console.log('   2. Digite "1" para Financeiro');
    console.log('   3. Escolha uma opção (1, 2 ou 3)');
    console.log('   4. Use "#" para voltar');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar
removeOutOfHours();