const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'layout', 'index.js');

console.log('🔧 Ajustando horários da saudação (4:00 = Bom dia!)...\n');

try {
  // Ler o arquivo atual
  let content = fs.readFileSync(filePath, 'utf8');
  
  console.log('📖 Arquivo lido com sucesso');
  
  // Substituir a lógica de horário atual
  const oldLogic = `                  if (hour >= 5 && hour < 12) {
                    return "Bom dia!";
                  } else if (hour >= 12 && hour < 18) {
                    return "Boa tarde!";
                  } else {
                    return "Boa noite!";
                  }`;
  
  const newLogic = `                  if (hour >= 4 && hour < 12) {
                    return "Bom dia!";
                  } else if (hour >= 12 && hour < 18) {
                    return "Boa tarde!";
                  } else {
                    return "Boa noite!";
                  }`;

  if (content.includes('hour >= 5 && hour < 12')) {
    content = content.replace(oldLogic, newLogic);
    console.log('✅ Horários atualizados com sucesso');
  } else {
    console.log('⚠️  Lógica de horário não encontrada para atualizar');
  }

  // Salvar o arquivo corrigido
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Arquivo salvo com sucesso!');
  
  console.log('\n🎯 NOVOS HORÁRIOS:');
  console.log('- 04:00 às 11:59 → "Bom dia!" ✨');
  console.log('- 12:00 às 17:59 → "Boa tarde!"');
  console.log('- 18:00 às 03:59 → "Boa noite!"');
  
  console.log('\n💡 AGORA ÀS 4:00 DA MANHÃ:');
  console.log('Será exibido: "Olá Matheus, Bom dia!" 🌅');

} catch (error) {
  console.error('❌ Erro ao aplicar correção:', error.message);
}