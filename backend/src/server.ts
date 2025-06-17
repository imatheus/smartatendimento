import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import { startQueueProcess } from "./queues";
import ProcessPendingSchedules from "./services/ScheduleServices/ProcessPendingSchedules";
import Company from "./models/Company";

const server = app.listen(process.env.PORT, async () => {
  const companies = await Company.findAll();
  const allPromises: any[] = [];
  companies.map(async c => {
    const promise = StartAllWhatsAppsSessions(c.id);
    allPromises.push(promise);
  });

  Promise.all(allPromises).then(async () => {
    // Inicializar sistema de filas
    startQueueProcess();
    
    // Processar agendamentos pendentes após inicialização
    setTimeout(async () => {
      await ProcessPendingSchedules();
    }, 5000); // Aguardar 5 segundos para garantir que tudo esteja inicializado
  });
  logger.info(`Server started on port: ${process.env.PORT}`);
});

initIO(server);
gracefulShutdown(server);
