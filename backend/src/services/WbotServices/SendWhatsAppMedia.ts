import { WASocket } from "@adiwajshing/baileys";
import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { writeFile } from "fs";
import { promisify } from "util";
import { join } from "path";

const writeFileAsync = promisify(writeFile);

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
}

const SendWhatsAppMedia = async ({
  media,
  ticket
}: Request): Promise<Message> => {
  try {
    const wbot = await GetTicketWbot(ticket);

    // Determine message type based on media mimetype
    let messageContent: any;
    const mediaType = media.mimetype.split("/")[0];
    
    switch (mediaType) {
      case "image":
        messageContent = {
          image: { url: media.path },
          caption: media.originalname
        };
        break;
      case "video":
        messageContent = {
          video: { url: media.path },
          caption: media.originalname
        };
        break;
      case "audio":
        messageContent = {
          audio: { url: media.path },
          mimetype: media.mimetype
        };
        break;
      default:
        messageContent = {
          document: { url: media.path },
          mimetype: media.mimetype,
          fileName: media.originalname
        };
    }

    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.contact.isGroup ? "g.us" : "s.whatsapp.net"}`,
      messageContent
    );

    // Copy media file to public directory
    try {
      await writeFileAsync(
        join(__dirname, "..", "..", "..", "public", media.filename),
        media.buffer || require("fs").readFileSync(media.path)
      );
    } catch (err) {
      console.log("Error copying media file:", err);
    }

    // Create message record in database
    const messageData = {
      id: sentMessage.key.id,
      ticketId: ticket.id,
      contactId: undefined, // fromMe messages don't have contactId
      body: media.originalname,
      fromMe: true,
      read: true,
      mediaType: mediaType,
      mediaUrl: media.filename,
      ack: 1, // sent
      dataJson: JSON.stringify(sentMessage)
    };

    // Update ticket's last message
    await ticket.update({ lastMessage: media.originalname });

    // Create message and emit socket event
    const newMessage = await CreateMessageService({ 
      messageData, 
      companyId: ticket.companyId 
    });

    return newMessage;

  } catch (err) {
    console.log("Error sending WhatsApp media:", err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMedia;