import { Op } from "sequelize";
import moment from "moment";

import Schedule from "../../models/Schedule";
import ScheduleJobService from "./ScheduleJobService";
import { logger } from "../../utils/logger";

const ProcessPendingSchedules = async (): Promise<void> => {
  try {
    logger.info("Processing pending schedules...");

    // Buscar agendamentos pendentes
    const pendingSchedules = await Schedule.findAll({
      where: {
        status: "PENDENTE",
        sentAt: null,
        sendAt: {
          [Op.gte]: moment().subtract(1, 'day').toDate() // Últimas 24 horas para evitar spam
        }
      }
    });

    logger.info(`Found ${pendingSchedules.length} pending schedules`);

    // Reagendar cada um
    for (const schedule of pendingSchedules) {
      try {
        await ScheduleJobService(schedule);
        logger.info(`Rescheduled pending schedule ${schedule.id}`);
      } catch (error) {
        logger.error(`Error rescheduling schedule ${schedule.id}:`, error);
        // Marcar como erro se não conseguir reagendar
        await schedule.update({ status: 'ERRO' });
      }
    }

    logger.info("Finished processing pending schedules");

  } catch (error) {
    logger.error("Error processing pending schedules:", error);
  }
};

export default ProcessPendingSchedules;