const fs = require('fs');
const path = require('path');

console.log('🗑️ Removendo aba "Ajuda" e todas as funcionalidades relacionadas...\n');

// 1. Remover da página SettingsCustom
const settingsPath = path.join(__dirname, 'src', 'pages', 'SettingsCustom', 'index.js');

try {
  console.log('📝 Modificando SettingsCustom/index.js...');
  
  let settingsContent = fs.readFileSync(settingsPath, 'utf8');
  
  // Remover import do HelpsManager
  settingsContent = settingsContent.replace(/import HelpsManager from "\.\.\/\.\.\/components\/HelpsManager";\n/, '');
  
  // Remover a aba "Ajuda" das tabs
  settingsContent = settingsContent.replace(/\s*\{isSuper\(\) \? <Tab label="Ajuda" value=\{"helps"\} \/> : null\}/, '');
  
  // Remover o TabPanel da ajuda
  const helpTabPanelRegex = /\s*<OnlyForSuperUser\s+user=\{currentUser\}\s+yes=\{\(\) => \(\s+<TabPanel\s+className=\{classes\.container\}\s+value=\{tab\}\s+name=\{"helps"\}\s+>\s+<HelpsManager \/>\s+<\/TabPanel>\s+\)\}\s+\/>/s;
  settingsContent = settingsContent.replace(helpTabPanelRegex, '');
  
  fs.writeFileSync(settingsPath, settingsContent, 'utf8');
  console.log('✅ SettingsCustom/index.js atualizado');
  
} catch (error) {
  console.error('❌ Erro ao modificar SettingsCustom:', error.message);
}

// 2. Remover da tradução
const translationPath = path.join(__dirname, 'src', 'translate', 'languages', 'pt.js');

try {
  console.log('📝 Modificando traduções...');
  
  let translationContent = fs.readFileSync(translationPath, 'utf8');
  
  // Remover referências à ajuda
  translationContent = translationContent.replace(/\s*helps: "Ajuda",/, '');
  translationContent = translationContent.replace(/\s*helps: \{\s*title: "Central de Ajuda",\s*\},/s, '');
  
  fs.writeFileSync(translationPath, translationContent, 'utf8');
  console.log('✅ Traduções atualizadas');
  
} catch (error) {
  console.error('❌ Erro ao modificar traduções:', error.message);
}

// 3. Remover rota das páginas de ajuda
const routesPath = path.join(__dirname, 'src', 'routes', 'index.js');

try {
  console.log('📝 Modificando rotas...');
  
  let routesContent = fs.readFileSync(routesPath, 'utf8');
  
  // Remover import e rota
  routesContent = routesContent.replace(/import Helps from "\.\.\/pages\/Helps\/";\n/, '');
  routesContent = routesContent.replace(/\s*<Route exact path="\/helps" component=\{Helps\} isPrivate \/>\n/, '');
  
  fs.writeFileSync(routesPath, routesContent, 'utf8');
  console.log('✅ Rotas atualizadas');
  
} catch (error) {
  console.error('❌ Erro ao modificar rotas:', error.message);
}

console.log('\n🎯 RESUMO DAS ALTERAÇÕES:');
console.log('✅ Removido import do HelpsManager');
console.log('✅ Removida aba "Ajuda" das configurações');
console.log('✅ Removido TabPanel da ajuda');
console.log('✅ Removidas traduções relacionadas à ajuda');
console.log('✅ Removida rota /helps');

console.log('\n💡 ARQUIVOS QUE PODEM SER REMOVIDOS MANUALMENTE:');
console.log('- src/pages/Helps/');
console.log('- src/components/HelpsManager/');
console.log('- src/hooks/useHelps/');

console.log('\n✅ Aba "Ajuda" removida com sucesso!');