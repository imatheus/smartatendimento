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

async function addGreeting() {
  try {
    console.log('📝 Adicionando mensagem de saudação ao WhatsApp...\n');

    // Atualizar mensagem de saudação do WhatsApp
    await sequelize.query(`
      UPDATE "Whatsapps" 
      SET "greetingMessage" = 'Olá! Bem-vindo ao nosso atendimento. Escolha uma das opções abaixo:', 
          "updatedAt" = NOW()
      WHERE id = 7
    `);
    
    console.log('✅ Mensagem de saudação adicionada ao WhatsApp');

    // Verificar resultado
    const [whatsapp] = await sequelize.query(`
      SELECT id, name, "greetingMessage" FROM "Whatsapps" WHERE id = 7
    `);
    
    console.log('\n📱 WhatsApp atualizado:');
    console.log(`   - Nome: ${whatsapp[0].name}`);
    console.log(`   - Saudação: "${whatsapp[0].greetingMessage}"`);
    
    console.log('\n✅ Configuração concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar
addGreeting();