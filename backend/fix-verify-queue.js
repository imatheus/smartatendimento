// Script para aplicar a correção na função verifyQueue
// Este script mostra a correção que deve ser aplicada manualmente

console.log(`
🔧 CORREÇÃO NECESSÁRIA NA FUNÇÃO verifyQueue

Localizar a seção que começa com:
    // Se tem chatbot, mostrar as opções do setor imediatamente
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
    }

E SUBSTITUIR por:
    // Se tem chatbot, verificar horário de funcionamento antes de mostrar opções
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
    }

TAMBÉM é necessário REMOVER a verificação de horário da função handleChatbot:
Localizar e REMOVER esta seção:
  // Verificar horário de funcionamento
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
  }

✅ RESULTADO ESPERADO:
1. Usuário seleciona setor Financeiro
2. Sistema verifica horário IMEDIATAMENTE
3. Se fora do horário: mostra "O expediente acabou 💀"
4. Se dentro do horário: mostra opções do chatbot

Aplique essas correções manualmente no arquivo:
backend/src/services/WbotServices/wbotMessageListener.ts
`);