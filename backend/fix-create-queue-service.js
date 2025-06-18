const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'services', 'QueueService', 'CreateQueueService.ts');

console.log('🔧 Aplicando correção no CreateQueueService.ts...\n');

try {
  // Ler o arquivo atual
  let content = fs.readFileSync(filePath, 'utf8');
  
  console.log('📖 Arquivo lido com sucesso');
  
  // 1. Adicionar import do Whatsapp
  const oldImports = `import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import Company from "../../models/Company";
import Plan from "../../models/Plan";`;

  const newImports = `import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import Company from "../../models/Company";
import Plan from "../../models/Plan";
import Whatsapp from "../../models/Whatsapp";`;

  content = content.replace(oldImports, newImports);
  console.log('✅ Import do Whatsapp adicionado');

  // 2. Modificar o final da função para incluir associação automática
  const oldReturn = `  const queue = await Queue.create({
    ...queueData,
    schedules: queueData.schedules || []
  });

  return queue;`;

  const newReturn = `  const queue = await Queue.create({
    ...queueData,
    schedules: queueData.schedules || []
  });

  // Automaticamente associar o novo setor a todos os WhatsApps da empresa
  const whatsapps = await Whatsapp.findAll({
    where: { companyId }
  });

  if (whatsapps.length > 0) {
    console.log(\`[CREATE QUEUE] Associando setor "\${queue.name}" a \${whatsapps.length} WhatsApp(s)\`);
    
    for (const whatsapp of whatsapps) {
      await whatsapp.$add("queues", queue.id);
      console.log(\`[CREATE QUEUE] Setor "\${queue.name}" associado ao WhatsApp "\${whatsapp.name}"\`);
    }
  }

  return queue;`;

  content = content.replace(oldReturn, newReturn);
  console.log('✅ Lógica de associação automática adicionada');

  // Salvar o arquivo corrigido
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Arquivo salvo com sucesso!');
  
  console.log('\n🎯 CORREÇÃO APLICADA:');
  console.log('- Novos setores serão automaticamente associados a todos os WhatsApps');
  console.log('- Não será mais necessário associar manualmente');
  console.log('\n💡 RESULTADO:');
  console.log('- Quando criar um novo setor, ele aparecerá automaticamente no primeiro contato');
  console.log('- Todos os WhatsApps da empresa terão acesso ao novo setor');

} catch (error) {
  console.error('❌ Erro ao aplicar correção:', error.message);
}