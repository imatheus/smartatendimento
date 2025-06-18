const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'layout', 'index.js');

console.log('🔧 Ajustando saudação no header...\n');

try {
  // Ler o arquivo atual
  let content = fs.readFileSync(filePath, 'utf8');
  
  console.log('📖 Arquivo lido com sucesso');
  
  // Substituir a saudação estática pela dinâmica
  const oldGreeting = `                Olá <b>{user.name}</b>, Seja bem-vindo.`;
  
  const newGreeting = `                Olá <b>{user.name}</b>, {(() => {
                  const now = new Date();
                  const hour = now.getHours();
                  
                  if (hour >= 4 && hour < 12) {
                    return "Bom dia!";
                  } else if (hour >= 12 && hour < 18) {
                    return "Boa tarde!";
                  } else {
                    return "Boa noite!";
                  }
                })()}`;

  if (content.includes('Seja bem-vindo.')) {
    content = content.replace(oldGreeting, newGreeting);
    console.log('✅ Saudação dinâmica implementada');
  } else {
    console.log('⚠️  Texto "Seja bem-vindo." não encontrado');
  }

  // Salvar o arquivo corrigido
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Arquivo salvo com sucesso!');
  
  console.log('\n🎯 SAUDAÇÃO ATUALIZADA:');
  console.log('- 05:00 às 11:59 → "Bom dia!"');
  console.log('- 12:00 às 17:59 → "Boa tarde!"');
  console.log('- 18:00 às 04:59 → "Boa noite!"');
  
  console.log('\n💡 EXEMPLO:');
  console.log('Agora será exibido: "Olá Matheus, Boa noite!" (dependendo do horário)');

} catch (error) {
  console.error('❌ Erro ao aplicar correção:', error.message);
}