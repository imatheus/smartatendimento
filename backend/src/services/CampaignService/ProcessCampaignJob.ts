import { Job } from "bull";
import * as Sentry from "@sentry/node";

import { logger } from "../../utils/logger";

interface ProcessCampaignData {
  id: number;
}

const ProcessCampaignJob = async (job: Job<ProcessCampaignData>): Promise<void> => {
  try {
    const { id } = job.data;
    
    logger.info(`Processing campaign job ${job.id} for campaign ${id}`);
    
    // TODO: Implementar processamento de campanhas
    // Por enquanto, apenas log para não quebrar o sistema
    logger.info(`Campaign ${id} processing completed`);

  } catch (error) {
    logger.error(`Error processing campaign job ${job.id}:`, error);
    Sentry.captureException(error);
    throw error;
  }
};

export default ProcessCampaignJob;