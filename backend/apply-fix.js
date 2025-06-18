const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'services', 'WbotServices', 'wbotMessageListener.ts');

console.log('🔧 Aplicando correções no arquivo wbotMessageListener.ts...\n');

try {
  // Ler o arquivo atual
  let content = fs.readFileSync(filePath, 'utf8');
  
  console.log('📖 Arquivo lido com sucesso');
  
  // 1. Remover verificação de horário da função handleChatbot
  const oldChatbotCheck = `  // Verificar horário de funcionamento
  if (ticket.queue !== null) {
    const { schedules }: any = queue;
    const now = moment();
    const weekday = now.format("dddd").toLowerCase();
    let schedule;

    if (Array.isArray(schedules) && schedules?.length > 0) {
      schedule = schedules.find((s) => s.weekdayEn === weekday && s.startTime !== "" && s.startTime !== null && s.endTime !== "" && s.endTime !== null);
    }

    if (ticket.queue.outOfHoursMessage !== null && ticket.queue.outOfHoursMessage !== "" && !isNil(schedule)) {
      const startTime = moment(schedule.startTime, "HH:mm");
      const endTime = moment(schedule.endTime, "HH:mm");

      if (now.isBefore(startTime) || now.isAfter(endTime)) {
        const body = formatBody(\`\${ticket.queue.outOfHoursMessage}\\n\\n*[ # ]* - Voltar ao Menu Principal\`, ticket.contact);
        await SendWhatsAppMessage({ body, ticket });
        return;
      }
    }
  }`;

  const newChatbotCheck = `  // A verificação de horário de funcionamento foi movida para verifyQueue
  // para ser executada imediatamente após a seleção do setor`;

  if (content.includes('// Verificar horário de funcionamento')) {
    content = content.replace(oldChatbotCheck, newChatbotCheck);
    console.log('✅ Removida verificação de horário da função handleChatbot');
  }

  // 2. Adicionar verificação de horário na função verifyQueue
  const oldQueueCheck = `    // Se tem chatbot, mostrar as opções do setor imediatamente
    if (chatbot) {
      const queueOptions = await QueueOption.findAll({
        where: { queueId: choosenQueue.id, parentId: null },
        order: [["option", "ASC"], ["createdAt", "ASC"]]
      });
      
      const queue = await Queue.findByPk(choosenQueue.id);
      let options = "";
      queueOptions.forEach((option) => {
        options += \`*[ \${option.option} ]* - \${option.title}\\n\`;
      });
      options += \`\\n*[ # ]* - Voltar ao Menu Principal\`;

      const textMessage = formatBody(\`\\u200e\${queue.greetingMessage}\\n\\n\${options}\`, contact);
      console.log(\`[DEBUG QUEUE] Enviando opções do chatbot: \${textMessage}\`);
      await SendWhatsAppMessage({ body: textMessage, ticket });
    }`;

  const newQueueCheck = `    // Se tem chatbot, verificar horário de funcionamento antes de mostrar opções
    if (chatbot) {
      const queue = await Queue.findByPk(choosenQueue.id);
      
      // Verificar horário de funcionamento ANTES de mostrar as opções
      const { schedules }: any = queue;
      const now = moment();
      const weekday = now.format("dddd").toLowerCase();
      let schedule;

      if (Array.isArray(schedules) && schedules?.length > 0) {
        schedule = schedules.find((s) => s.weekdayEn === weekday && s.startTime !== "" && s.startTime !== null && s.endTime !== "" && s.endTime !== null);
      }

      // Se está fora do horário e tem mensagem configurada
      if (queue.outOfHoursMessage !== null && queue.outOfHoursMessage !== "" && !isNil(schedule)) {
        const startTime = moment(schedule.startTime, "HH:mm");
        const endTime = moment(schedule.endTime, "HH:mm");

        if (now.isBefore(startTime) || now.isAfter(endTime)) {
          console.log(\`[DEBUG QUEUE] Fora do horário de funcionamento - enviando mensagem\`);
          const body = formatBody(\`\${queue.outOfHoursMessage}\\n\\n*[ # ]* - Voltar ao Menu Principal\`, contact);
          await SendWhatsAppMessage({ body, ticket });
          return;
        }
      }

      // Se está no horário, mostrar as opções do chatbot
      const queueOptions = await QueueOption.findAll({
        where: { queueId: choosenQueue.id, parentId: null },
        order: [["option", "ASC"], ["createdAt", "ASC"]]
      });
      
      let options = "";
      queueOptions.forEach((option) => {
        options += \`*[ \${option.option} ]* - \${option.title}\\n\`;
      });
      options += \`\\n*[ # ]* - Voltar ao Menu Principal\`;

      const textMessage = formatBody(\`\\u200e\${queue.greetingMessage}\\n\\n\${options}\`, contact);
      console.log(\`[DEBUG QUEUE] Enviando opções do chatbot: \${textMessage}\`);
      await SendWhatsAppMessage({ body: textMessage, ticket });
    }`;

  if (content.includes('// Se tem chatbot, mostrar as opções do setor imediatamente')) {
    content = content.replace(oldQueueCheck, newQueueCheck);
    console.log('✅ Adicionada verificação de horário na função verifyQueue');
  }

  // Salvar o arquivo corrigido
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Arquivo salvo com sucesso!');
  
  console.log('\n🎯 CORREÇÕES APLICADAS:');
  console.log('1. Verificação de horário removida da função handleChatbot');
  console.log('2. Verificação de horário adicionada na função verifyQueue');
  console.log('\n💡 RESULTADO ESPERADO:');
  console.log('- Usuário seleciona setor Financeiro');
  console.log('- Sistema verifica horário IMEDIATAMENTE');
  console.log('- Se fora do horário: mostra "O expediente acabou 💀"');
  console.log('- Se dentro do horário: mostra opções do chatbot');
  console.log('\n✅ Teste o fluxo novamente!');

} catch (error) {
  console.error('❌ Erro ao aplicar correções:', error.message);
}