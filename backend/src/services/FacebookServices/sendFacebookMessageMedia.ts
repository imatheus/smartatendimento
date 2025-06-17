import fs from "fs";
import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import { sendAttachmentFromUrl } from "./graphAPI";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { v4 as uuidv4 } from "uuid";
// import { verifyMessage } from "./facebookMessageListener";

interface Request {
  ticket: Ticket;
  media?: Express.Multer.File;
  body?: string;
  url?: string;
}

export const typeAttachment = (media: Express.Multer.File) => {
  if (media.mimetype.includes("image")) {
    return "image";
  }
  if (media.mimetype.includes("video")) {
    return "video";
  }
  
  return "file";
};

export const sendFacebookMessageMedia = async ({
  media,
  ticket,
  body
}: Request): Promise<Message> => {
  try {
    const type = typeAttachment(media);

    const domain = `${process.env.BACKEND_URL}/public/${media.filename}`

    const sendMessage = await sendAttachmentFromUrl(
      ticket.contact.number,
      domain,
      type,
      ticket.whatsapp.facebookUserToken
    );

    // Create message record in database
    const messageData = {
      id: uuidv4(),
      ticketId: ticket.id,
      contactId: undefined, // fromMe messages don't have contactId
      body: media.originalname || media.filename,
      fromMe: true,
      read: true,
      mediaType: type,
      mediaUrl: media.filename,
      ack: 1, // sent
      dataJson: JSON.stringify(sendMessage)
    };

    // Update ticket's last message
    await ticket.update({ lastMessage: media.filename });

    // Create message and emit socket event
    const newMessage = await CreateMessageService({ 
      messageData, 
      companyId: ticket.companyId 
    });

    fs.unlinkSync(media.path);

    return newMessage;
  } catch (err) {
    console.log("Error sending Facebook media:", err);
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }
};

export const sendFacebookMessageMediaExternal = async ({
  url,
  ticket,
  body
}: Request): Promise<any> => {
  try {
    const type = "image"

    // const domain = `${process.env.BACKEND_URL}/public/${media.filename}`

    const sendMessage = await sendAttachmentFromUrl(
      ticket.contact.number,
      url,
      type,
      ticket.whatsapp.facebookUserToken
    );

    const randomName = Math.random().toString(36).substring(7);

    await ticket.update({ lastMessage: body ||  `${randomName}.jpg}`});

    // fs.unlinkSync(media.path);

    return sendMessage;
  } catch (err) {
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }
};

export const sendFacebookMessageFileExternal = async ({
  url,
  ticket,
  body
}: Request): Promise<any> => {
  try {
    const type = "file"

    // const domain = `${process.env.BACKEND_URL}/public/${media.filename}`

    const sendMessage = await sendAttachmentFromUrl(
      ticket.contact.number,
      url,
      type,
      ticket.whatsapp.facebookUserToken
    );

    const randomName = Math.random().toString(36).substring(7);

    await ticket.update({ lastMessage: body ||  `${randomName}.pdf}`});

    // fs.unlinkSync(media.path);

    return sendMessage;
  } catch (err) {
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }
};