import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import QueueOption from "../../models/QueueOption";
import { FindOptions } from "sequelize/types";

const ShowWhatsAppService = async (
  id: string | number,
  companyId: number,
  session?: any
): Promise<Whatsapp> => {
  const findOptions: FindOptions = {
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"],
        include: [{ model: QueueOption, as: "options" }]
      }
    ],
    order: [["queues", "name", "ASC"]]
  };

  if (session !== undefined && session == 0) {
    findOptions.attributes = { exclude: ["session"] };
  }

  const whatsapp = await Whatsapp.findByPk(id, findOptions);

  if (whatsapp?.companyId !== companyId) {
    throw new AppError("Não é possível acessar registros de outra empresa");
  }

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  // Debug: Log para verificar os setores carregados
  console.log(`[DEBUG] WhatsApp ID: ${whatsapp.id}, Company ID: ${companyId}`);
  console.log(`[DEBUG] Setores carregados no WhatsApp: ${whatsapp.queues?.length || 0}`);
  whatsapp.queues?.forEach((queue, index) => {
    console.log(`[DEBUG] Queue ${index + 1}: ${queue.name} (ID: ${queue.id})`);
  });

  return whatsapp;
};

export default ShowWhatsAppService;
