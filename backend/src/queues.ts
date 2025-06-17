import Queue from "bull";
import * as Sentry from "@sentry/node";

import { logger } from "./utils/logger";
import ProcessScheduleJob from "./services/ScheduleServices/ProcessScheduleJob";
import ProcessCampaignJob from "./services/CampaignService/ProcessCampaignJob";

const redisConfig = {
  redis: {
    host: process.env.IO_REDIS_SERVER || "127.0.0.1",
    port: +(process.env.IO_REDIS_PORT || "6379"),
    password: process.env.IO_REDIS_PASSWORD || undefined,
    db: 3
  }
};

export const scheduleQueue = new Queue("ScheduleQueue", redisConfig);
export const campaignQueue = new Queue("CampaignQueue", redisConfig);

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

export const startQueueProcess = () => {
  logger.info("Starting queue processes...");
  
  // Limpar jobs antigos
  scheduleQueue.clean(24 * 60 * 60 * 1000, "completed");
  scheduleQueue.clean(24 * 60 * 60 * 1000, "failed");
  
  campaignQueue.clean(24 * 60 * 60 * 1000, "completed");
  campaignQueue.clean(24 * 60 * 60 * 1000, "failed");
  
  logger.info("Queue processes started successfully");
};