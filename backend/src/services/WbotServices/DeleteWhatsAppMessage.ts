import { WASocket } from "@adiwajshing/baileys";
import { getWbot } from "../../libs/wbot";

const DeleteWhatsAppMessage = async (
  messageId: string,
  whatsappId: number
): Promise<void> => {
  const wbot = getWbot(whatsappId);
  const message = await wbot.loadMessage(messageId);
  await wbot.chatModify(
    {
      clear: { messages: [{ id: message.key.id!, fromMe: true, timestamp: message.messageTimestamp as number }] }
    },
    message.key.remoteJid!
  );
};

export default DeleteWhatsAppMessage;