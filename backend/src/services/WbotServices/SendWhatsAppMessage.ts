import { WASocket } from "@adiwajshing/baileys";
import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: any;
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg
}: Request): Promise<void> => {
  try {
    const wbot = await GetTicketWbot(ticket);
    const message = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.contact.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        text: body
      },
      {
        quoted: quotedMsg
      }
    );

  } catch (err) {
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;