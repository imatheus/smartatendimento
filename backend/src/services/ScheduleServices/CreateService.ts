import * as Yup from "yup";
import moment from "moment";

import AppError from "../../errors/AppError";
import Schedule from "../../models/Schedule";
import ScheduleJobService from "./ScheduleJobService";
import { logger } from "../../utils/logger";

interface Request {
  body: string;
  sendAt: string;
  contactId: number | string;
  companyId: number | string;
  userId?: number | string;
}

const CreateService = async ({
  body,
  sendAt,
  contactId,
  companyId,
  userId
}: Request): Promise<Schedule> => {
  const schema = Yup.object().shape({
    body: Yup.string().required().min(5),
    sendAt: Yup.string().required()
  });

  try {
    await schema.validate({ body, sendAt });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Validar se a data de envio não é no passado
  const sendAtMoment = moment(sendAt);
  const now = moment();
  
  if (sendAtMoment.isBefore(now.subtract(1, 'minute'))) {
    throw new AppError("A data de envio não pode ser no passado");
  }

  const schedule = await Schedule.create(
    {
      body,
      sendAt,
      contactId,
      companyId,
      userId,
      status: 'PENDENTE'
    }
  );

  await schedule.reload();

  // Agendar o job para processamento
  try {
    await ScheduleJobService(schedule);
    logger.info(`Schedule ${schedule.id} created and job scheduled successfully`);
  } catch (error) {
    logger.error(`Error scheduling job for schedule ${schedule.id}:`, error);
    // Atualizar status para erro se não conseguir agendar
    await schedule.update({ status: 'ERRO' });
    throw new AppError("Erro ao agendar mensagem. Tente novamente.");
  }

  return schedule;
};

export default CreateService;
