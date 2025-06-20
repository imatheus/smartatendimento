import Queue from "bull";
import * as Sentry from "@sentry/node";

import { logger } from "./utils/logger";

const redisConfig = {
  redis: {
    host: process.env.IO_REDIS_SERVER || "127.0.0.1",
    port: +(process.env.IO_REDIS_PORT || "6379"),
    password: process.env.IO_REDIS_PASSWORD || undefined,
    db: 3
  }
};

let scheduleQueue: Queue.Queue | null = null;
let campaignQueue: Queue.Queue | null = null;

// Inicializar filas com tratamento de erro
try {
  scheduleQueue = new Queue("ScheduleQueue", redisConfig);
  campaignQueue = new Queue("CampaignQueue", redisConfig);
  
  logger.info("Background job queues initialized successfully");
} catch (error) {
  logger.error("Failed to initialize background job queues:", error);
}

// Exportar filas (podem ser null se Redis não estiver disponível)
export { scheduleQueue, campaignQueue };

export const startQueueProcess = async () => {
  try {
    logger.info("Starting background job processors...");
    
    if (!scheduleQueue || !campaignQueue) {
      logger.warn("Some queues not initialized - Redis may not be available");
      return;
    }

    // Importar processadores dinamicamente
    const ProcessScheduleJob = (await import("./services/ScheduleServices/ProcessScheduleJob")).default;
    const ProcessCampaignJob = (await import("./services/CampaignService/ProcessCampaignJob")).default;

    // Processamento de agendamentos
    scheduleQueue.process("ProcessSchedule", ProcessScheduleJob);

    // Processamento de campanhas
    campaignQueue.process("ProcessCampaign", ProcessCampaignJob);

    // Event listeners para logs
    scheduleQueue.on("completed", (job, result) => {
      logger.info(`Schedule job ${job.id} completed with result: ${result}`);
    });

    scheduleQueue.on("failed", (job, err) => {
      logger.error(`Schedule job ${job.id} failed with error: ${err.message}`);
      Sentry.captureException(err);
    });

    campaignQueue.on("completed", (job, result) => {
      logger.info(`Campaign job ${job.id} completed with result: ${result}`);
    });

    campaignQueue.on("failed", (job, err) => {
      logger.error(`Campaign job ${job.id} failed with error: ${err.message}`);
      Sentry.captureException(err);
    });

    
    // Limpar jobs antigos
    try {
      await scheduleQueue.clean(24 * 60 * 60 * 1000, "completed");
      await scheduleQueue.clean(24 * 60 * 60 * 1000, "failed");
      
      await campaignQueue.clean(24 * 60 * 60 * 1000, "completed");
      await campaignQueue.clean(24 * 60 * 60 * 1000, "failed");
    } catch (cleanError) {
      logger.warn("Failed to clean old jobs:", cleanError);
    }
    
    logger.info("Background job processors started successfully");
    
  } catch (error) {
    logger.error("Failed to start queue processes:", error);
    // Não falhar a inicialização do servidor se as filas falharem
  }
};