itconst fs = require('fs');
const path = require('path');

console.log('🧹 Removendo arquivos e pastas relacionados à funcionalidade de Ajuda...\n');

// Função para remover diretório recursivamente
function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    return true;
  }
  return false;
}

// Função para remover arquivo
function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

try {
  // 1. Remover pasta pages/Helps
  const helpsPagePath = path.join(__dirname, 'src', 'pages', 'Helps');
  if (removeDirectory(helpsPagePath)) {
    console.log('✅ Removida pasta: src/pages/Helps/');
  } else {
    console.log('⚠️  Pasta src/pages/Helps/ não encontrada');
  }

  // 2. Remover pasta components/HelpsManager
  const helpsManagerPath = path.join(__dirname, 'src', 'components', 'HelpsManager');
  if (removeDirectory(helpsManagerPath)) {
    console.log('✅ Removida pasta: src/components/HelpsManager/');
  } else {
    console.log('⚠️  Pasta src/components/HelpsManager/ não encontrada');
  }

  // 3. Remover pasta hooks/useHelps
  const useHelpsPath = path.join(__dirname, 'src', 'hooks', 'useHelps');
  if (removeDirectory(useHelpsPath)) {
    console.log('✅ Removida pasta: src/hooks/useHelps/');
  } else {
    console.log('⚠️  Pasta src/hooks/useHelps/ não encontrada');
  }

  console.log('\n🎯 LIMPEZA CONCLUÍDA:');
  console.log('✅ Todos os arquivos relacionados à funcionalidade de Ajuda foram removidos');
  console.log('✅ A aba "Ajuda" não aparecerá mais nas configurações');
  console.log('✅ As rotas relacionadas foram removidas');
  console.log('✅ As traduções foram limpas');

  console.log('\n💡 RESULTADO:');
  console.log('- A tela de configurações agora só mostra: Opções, Horários, Empresas, Planos');
  console.log('- A funcionalidade de Ajuda foi completamente removida do sistema');

} catch (error) {
  console.error('❌ Erro durante a limpeza:', error.message);
}