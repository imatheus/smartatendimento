import { join } from "path";
import { promisify } from "util";
import { writeFile } from "fs";
import * as Sentry from "@sentry/node";
import { isNil, head } from "lodash";

import {
  AnyWASocket,
  downloadContentFromMessage,
  extractMessageContent,
  getContentType,
  jidNormalizedUser,
  MediaType,
  MessageUpsertType,
  proto,
  WALegacySocket,
  WAMessage,
  WAMessageStubType,
  WAMessageUpdate,
  WASocket,
} from "@adiwajshing/baileys";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";

import { getIO } from "../../libs/socket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { logger } from "../../utils/logger";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import formatBody from "../../helpers/Mustache";
import TicketTraking from "../../models/TicketTraking";
import UserRating from "../../models/UserRating";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import moment from "moment";
import Queue from "../../models/Queue";
import QueueOption from "../../models/QueueOption";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import VerifyCurrentSchedule from "../CompanyService/VerifyCurrentSchedule";
import Setting from "../../models/Setting";
import { cacheLayer } from "../../libs/cache";
import { debounce } from "../../helpers/Debounce";

type Session = AnyWASocket & {
  id?: number;
};

interface ImessageUpsert {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}

interface IMe {
  name: string;
  id: string;
}

const writeFileAsync = promisify(writeFile);

const getTypeMessage = (msg: proto.IWebMessageInfo): string => {
  return getContentType(msg.message);
};

export const getBodyMessage = (msg: proto.IWebMessageInfo): string | null => {
  try {
    const type = getTypeMessage(msg);
    const types = {
      conversation: msg.message?.conversation,
      imageMessage: msg.message?.imageMessage?.caption,
      videoMessage: msg.message?.videoMessage?.caption,
      extendedTextMessage: msg.message?.extendedTextMessage?.text,
      buttonsResponseMessage: msg.message?.buttonsResponseMessage?.selectedButtonId,
      listResponseMessage: msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId,
      templateButtonReplyMessage: msg.message?.templateButtonReplyMessage?.selectedId,
      stickerMessage: "sticker",
      contactMessage: msg.message?.contactMessage?.vcard,
      locationMessage: `Latitude: ${msg.message?.locationMessage?.degreesLatitude} - Longitude: ${msg.message?.locationMessage?.degreesLongitude}`,
      liveLocationMessage: `Latitude: ${msg.message?.liveLocationMessage?.degreesLatitude} - Longitude: ${msg.message?.liveLocationMessage?.degreesLongitude}`,
      documentMessage: msg.message?.documentMessage?.title,
      audioMessage: "Áudio",
      reactionMessage: msg.message?.reactionMessage?.text || "reaction",
    };

    return types[type];
  } catch (error) {
    Sentry.setExtra("Error getTypeMessage", { msg });
    Sentry.captureException(error);
    return null;
  }
};

const getQuotedMessageId = (msg: proto.IWebMessageInfo): string | null => {
  const body = extractMessageContent(msg.message);
  return body?.contextInfo?.stanzaId || null;
};

const getMeSocket = (wbot: Session): IMe => {
  return wbot.type === "legacy"
    ? { id: jidNormalizedUser((wbot as WALegacySocket).state.legacy.user.id), name: (wbot as WALegacySocket).state.legacy.user.name }
    : { id: jidNormalizedUser((wbot as WASocket).user.id), name: (wbot as WASocket).user.name };
};

const getSenderMessage = (msg: proto.IWebMessageInfo, wbot: Session): string => {
  const me = getMeSocket(wbot);
  if (msg.key.fromMe) return me.id;
  const senderId = msg.participant || msg.key.participant || msg.key.remoteJid || undefined;
  return senderId && jidNormalizedUser(senderId);
};

const getContactMessage = async (msg: proto.IWebMessageInfo, wbot: Session) => {
  const isGroup = msg.key.remoteJid.endsWith("@g.us");
  const rawNumber = msg.key.remoteJid.replace(/\D/g, "");
  return isGroup
    ? { id: getSenderMessage(msg, wbot), name: msg.pushName }
    : { id: msg.key.remoteJid, name: msg.key.fromMe ? rawNumber : msg.pushName || msg.key.remoteJid.replace(/\D/g, "") };
};

const downloadMedia = async (msg: proto.IWebMessageInfo) => {
  const mineType = msg.message?.imageMessage || msg.message?.audioMessage || msg.message?.videoMessage || msg.message?.stickerMessage || msg.message?.documentMessage;
  const messageType = mineType.mimetype.split("/")[0].replace("application", "document") as MediaType;

  let stream: any;
  try {
    stream = await downloadContentFromMessage(mineType, messageType);
  } catch (error) {
    logger.error(error, "Error downloading media");
    return null;
  }

  let buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }

  if (!buffer) {
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }

  let filename = msg.message?.documentMessage?.fileName || "";
  if (!filename) {
    const ext = mineType.mimetype.split("/")[1].split(";")[0];
    filename = `${new Date().getTime()}.${ext}`;
  }

  const media = { data: buffer, mimetype: mineType.mimetype, filename };
  return media;
};

const verifyContact = async (msgContact: IMe, wbot: Session, companyId: number): Promise<Contact> => {
  let profilePicUrl: string;
  try {
    profilePicUrl = await wbot.profilePictureUrl(msgContact.id);
  } catch (e) {
    profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
  }

  const contactData = {
    name: msgContact?.name || msgContact.id.replace(/\D/g, ""),
    number: msgContact.id.replace(/\D/g, ""),
    profilePicUrl,
    isGroup: msgContact.id.endsWith("g.us"),
    companyId,
  };

  return CreateOrUpdateContactService(contactData);
};

const verifyQuotedMessage = async (msg: proto.IWebMessageInfo): Promise<Message | null> => {
  const quotedId = getQuotedMessageId(msg);
  if (!quotedId) return null;
  return Message.findByPk(quotedId);
};

const verifyMediaMessage = async (msg: proto.IWebMessageInfo, ticket: Ticket, contact: Contact): Promise<Message> => {
  const io = getIO();
  const quotedMsg = await verifyQuotedMessage(msg);
  const media = await downloadMedia(msg);

  if (!media) {
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }

  try {
    await writeFileAsync(join(__dirname, "..", "..", "..", "public", media.filename), media.data, "base64");
  } catch (err) {
    logger.error(err, "Error writing media file");
  }

  const body = getBodyMessage(msg) || media.filename;
  const messageData = {
    id: msg.key.id,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body,
    fromMe: msg.key.fromMe,
    read: msg.key.fromMe,
    mediaUrl: media.filename,
    mediaType: media.mimetype.split("/")[0],
    quotedMsgId: quotedMsg?.id,
    ack: msg.status,
    dataJson: JSON.stringify(msg),
  };

  await ticket.update({ lastMessage: body });

  const newMessage = await CreateMessageService({ messageData, companyId: ticket.companyId });

  if (!msg.key.fromMe && ticket.status === "closed") {
    await ticket.update({ status: "pending" });
    await ticket.reload({
      include: [{ model: Queue, as: "queue" }, { model: User, as: "user" }, { model: Contact, as: "contact" }],
    });

    io.to("closed").emit(`company-${ticket.companyId}-ticket`, {
      action: "delete",
      ticketId: ticket.id,
    });

    io.to(ticket.status).to(ticket.id.toString()).emit(`company-${ticket.companyId}-ticket`, {
      action: "update",
      ticket,
    });
  }
  return newMessage;
};

export const verifyMessage = async (msg: proto.IWebMessageInfo, ticket: Ticket, contact: Contact) => {
  const io = getIO();
  const quotedMsg = await verifyQuotedMessage(msg);
  const body = getBodyMessage(msg);

  const messageData = {
    id: msg.key.id,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body,
    fromMe: msg.key.fromMe,
    mediaType: getTypeMessage(msg),
    read: msg.key.fromMe,
    quotedMsgId: quotedMsg?.id,
    ack: msg.status,
    dataJson: JSON.stringify(msg)
  };

  await ticket.update({ lastMessage: body });

  await CreateMessageService({ messageData, companyId: ticket.companyId });

  if (!msg.key.fromMe && ticket.status === "closed") {
    await ticket.update({ status: "pending" });
    await ticket.reload({
      include: [{ model: Queue, as: "queue" }, { model: User, as: "user" }, { model: Contact, as: "contact" }]
    });

    io.to("closed").emit(`company-${ticket.companyId}-ticket`, { action: "delete", ticketId: ticket.id });
    io.to(ticket.status).to(ticket.id.toString()).emit(`company-${ticket.companyId}-ticket`, { action: "update", ticket });
  }
};

const isValidMsg = (msg: proto.IWebMessageInfo): boolean => {
  if (msg.key.remoteJid === "status@broadcast") return false;
  try {
    const msgType = getTypeMessage(msg);
    if (!msgType) return false;
    return true;
  } catch (error) {
    logger.error(error, "Error checking message validity");
    return false;
  }
};

const verifyQueue = async (wbot: Session, msg: proto.IWebMessageInfo, ticket: Ticket, contact: Contact) => {
  const { queues, greetingMessage } = await ShowWhatsAppService(wbot.id!, ticket.companyId);

  if (queues.length === 1) {
    await UpdateTicketService({ ticketData: { queueId: queues[0].id }, ticketId: ticket.id, companyId: ticket.companyId });
    return;
  }

  const selectedOption = getBodyMessage(msg);
  const choosenQueue = queues.find((q, i) => i + 1 === +selectedOption);

  if (choosenQueue) {
    await UpdateTicketService({ ticketData: { queueId: choosenQueue.id }, ticketId: ticket.id, companyId: ticket.companyId });
  } else {
    let options = "";
    queues.forEach((queue, index) => {
      options += `*[ ${index + 1} ]* - ${queue.name}\n`;
    });
    const body = formatBody(`\u200e${greetingMessage}\n\n${options}`, contact);
    await SendWhatsAppMessage({ body, ticket });
  }
};

const handleMessage = async (msg: proto.IWebMessageInfo, wbot: Session, companyId: number): Promise<void> => {
  if (!isValidMsg(msg)) return;

  try {
    let msgContact: IMe;
    let groupContact: Contact | undefined;
    const isGroup = msg.key.remoteJid?.endsWith("@g.us");
    const bodyMessage = getBodyMessage(msg);

    if (msg.key.fromMe) {
      if (/\u200e/.test(bodyMessage)) return;
      msgContact = await getContactMessage(msg, wbot);
    } else {
      msgContact = await getContactMessage(msg, wbot);
    }

    if (isGroup) {
      const grupoMeta = await wbot.groupMetadata(msg.key.remoteJid, false);
      const msgGroupContact = { id: grupoMeta.id, name: grupoMeta.subject };
      groupContact = await verifyContact(msgGroupContact, wbot, companyId);
    }

    const whatsapp = await ShowWhatsAppService(wbot.id!, companyId);
    const contact = await verifyContact(msgContact, wbot, companyId);
    const ticket = await FindOrCreateTicketService(contact, wbot.id!, 0, companyId, groupContact);

    const hasMedia = msg.message?.imageMessage || msg.message?.audioMessage || msg.message?.videoMessage || msg.message?.documentMessage || msg.message.stickerMessage;

    if (hasMedia) {
      await verifyMediaMessage(msg, ticket, contact);
    } else {
      await verifyMessage(msg, ticket, contact);
    }

    if (!ticket.queue && !isGroup && !msg.key.fromMe && !ticket.userId && whatsapp.queues.length >= 1) {
      await verifyQueue(wbot, msg, ticket, contact);
    }
  } catch (err) {
    logger.error(err, "Error handling message");
  }
};

const filterMessages = (msg: WAMessage): boolean => {
  if (msg.message?.protocolMessage) return false;
  const stubTypes = [
    WAMessageStubType.REVOKE,
    WAMessageStubType.E2E_DEVICE_CHANGED,
    WAMessageStubType.E2E_IDENTITY_CHANGED,
    WAMessageStubType.CIPHERTEXT
  ];
  if (stubTypes.includes(msg.messageStubType as WAMessageStubType)) return false;
  return true;
};

const wbotMessageListener = async (wbot: Session, companyId: number): Promise<void> => {
  try {
    wbot.ev.on("messages.upsert", async (messageUpsert: ImessageUpsert) => {
      const messages = messageUpsert.messages.filter(filterMessages);
      if (!messages) return;

      for (const message of messages) {
        const messageExists = await Message.count({ where: { id: message.key.id!, companyId } });
        if (!messageExists) {
          await handleMessage(message, wbot, companyId);
        }
      }
    });

    wbot.ev.on("messages.update", (messageUpdate: WAMessageUpdate[]) => {
      if (messageUpdate.length === 0) return;
      for (const message of messageUpdate) {
        // Handle message updates (ack, etc.) here if needed
      }
    });
  } catch (error) {
    logger.error(error, "Error handling wbot message listener");
  }
};

export { wbotMessageListener };