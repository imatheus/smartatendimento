import Schedule from "../../models/Schedule";
import AppError from "../../errors/AppError";
import { scheduleQueue } from "../../queues";
import { logger } from "../../utils/logger";

const DeleteService = async (id: string | number, companyId: number): Promise<void> => {
  const schedule = await Schedule.findOne({
    where: { id, companyId }
  });

  if (!schedule) {
    throw new AppError("ERR_NO_SCHEDULE_FOUND", 404);
  }

  // Cancelar jobs pendentes antes de excluir
  try {
    const jobs = await scheduleQueue.getJobs(['waiting', 'delayed']);
    for (const job of jobs) {
      if (job.data.scheduleId === schedule.id) {
        await job.remove();
        logger.info(`Removed job for deleted schedule ${schedule.id}`);
      }
    }
  } catch (error) {
    logger.error(`Error removing jobs for schedule ${schedule.id}:`, error);
  }

  await schedule.destroy();
};

export default DeleteService;
