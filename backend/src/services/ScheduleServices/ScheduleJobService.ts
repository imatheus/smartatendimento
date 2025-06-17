import moment from "moment";
import { scheduleQueue } from "../../queues";
import { logger } from "../../utils/logger";
import Schedule from "../../models/Schedule";

interface ScheduleJobData {
  scheduleId: number;
  sendAt: string;
}

const ScheduleJobService = async (schedule: Schedule): Promise<void> => {
  try {
    const sendAt = moment(schedule.sendAt);
    const now = moment();
    
    // Calcular delay em milissegundos
    const delay = sendAt.diff(now);
    
    if (delay <= 0) {
      // Se a data já passou, processar imediatamente
      logger.info(`Schedule ${schedule.id} is overdue, processing immediately`);
      await scheduleQueue.add(
        "ProcessSchedule",
        { scheduleId: schedule.id },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000
          }
        }
      );
    } else {
      // Agendar para o futuro
      logger.info(`Scheduling job for schedule ${schedule.id} to run at ${sendAt.format()}`);
      await scheduleQueue.add(
        "ProcessSchedule",
        { scheduleId: schedule.id },
        {
          delay,
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000
          }
        }
      );
    }
    
    logger.info(`Job scheduled successfully for schedule ${schedule.id}`);
    
  } catch (error) {
    logger.error(`Error scheduling job for schedule ${schedule.id}:`, error);
    throw error;
  }
};

export default ScheduleJobService;