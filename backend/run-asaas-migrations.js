const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Executando migrations do Asaas...');

// Executar migrations
const migrationCommands = [
  'npx sequelize db:migrate --migrations-path src/database/migrations --config src/config/database.js'
];

async function runMigrations() {
  for (const command of migrationCommands) {
    console.log(`Executando: ${command}`);
    
    try {
      await new Promise((resolve, reject) => {
        exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
          if (error) {
            console.error(`❌ Erro: ${error.message}`);
            reject(error);
            return;
          }
          
          if (stderr) {
            console.warn(`⚠️  Warning: ${stderr}`);
          }
          
          console.log(`✅ Sucesso: ${stdout}`);
          resolve();
        });
      });
    } catch (error) {
      console.error(`❌ Falha ao executar migration: ${error.message}`);
      process.exit(1);
    }
  }
  
  console.log('🎉 Todas as migrations do Asaas foram executadas com sucesso!');
  console.log('');
  console.log('📋 Próximos passos:');
  console.log('1. Reinicie o servidor backend');
  console.log('2. Acesse a aba "Integrações > ASAAS" no frontend');
  console.log('3. Configure sua chave de API do Asaas');
  console.log('4. Teste a conexão e crie cliente/assinatura');
  console.log('');
  console.log('🔗 Webhook URL para configurar no Asaas:');
  console.log('   http://seu-dominio.com/asaas/webhook');
}

runMigrations().catch(console.error);