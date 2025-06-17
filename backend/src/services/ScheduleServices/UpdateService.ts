import * as Yup from "yup";
import moment from "moment";

import AppError from "../../errors/AppError";
import Schedule from "../../models/Schedule";
import ShowService from "./ShowService";
import ScheduleJobService from "./ScheduleJobService";
import { scheduleQueue } from "../../queues";
import { logger } from "../../utils/logger";

interface ScheduleData {
  id?: number;
  body?: string;
  sendAt?: string;
  sentAt?: string;
  contactId?: number;
  companyId?: number;
  ticketId?: number;
  userId?: number;
}

interface Request {
  scheduleData: ScheduleData;
  id: string | number;
  companyId: number;
}

const UpdateUserService = async ({
  scheduleData,
  id,
  companyId
}: Request): Promise<Schedule | undefined> => {
  const schedule = await ShowService(id, companyId);

  if (schedule?.companyId !== companyId) {
    throw new AppError("Não é possível alterar registros de outra empresa");
  }

  // Verificar se já foi enviado
  if (schedule.sentAt) {
    throw new AppError("Não é possível alterar um agendamento já enviado");
  }

  const schema = Yup.object().shape({
    body: Yup.string().min(5)
  });

  const {
    body,
    sendAt,
    sentAt,
    contactId,
    ticketId,
    userId,
  } = scheduleData;

  try {
    await schema.validate({ body });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Se a data de envio mudou, validar e reagendar
  const shouldReschedule = sendAt && sendAt !== schedule.sendAt && schedule.status === 'PENDENTE';
  
  if (shouldReschedule) {
    // Validar nova data
    const sendAtMoment = moment(sendAt);
    const now = moment();
    
    if (sendAtMoment.isBefore(now.subtract(1, 'minute'))) {
      throw new AppError("A data de envio não pode ser no passado");
    }

    // Cancelar jobs existentes para este agendamento
    try {
      const jobs = await scheduleQueue.getJobs(['waiting', 'delayed']);
      for (const job of jobs) {
        if (job.data.scheduleId === schedule.id) {
          await job.remove();
          logger.info(`Removed existing job for schedule ${schedule.id}`);
        }
      }
    } catch (error) {
      logger.error(`Error removing existing jobs for schedule ${schedule.id}:`, error);
    }
  }

  await schedule.update({
    body,
    sendAt,
    sentAt,
    contactId,
    ticketId,
    userId,
  });

  await schedule.reload();

  // Reagendar se necessário
  if (shouldReschedule) {
    try {
      await ScheduleJobService(schedule);
      logger.info(`Schedule ${schedule.id} updated and rescheduled successfully`);
    } catch (error) {
      logger.error(`Error rescheduling job for schedule ${schedule.id}:`, error);
      await schedule.update({ status: 'ERRO' });
      throw new AppError("Erro ao reagendar mensagem. Tente novamente.");
    }
  }

  return schedule;
};

export default UpdateUserService;
