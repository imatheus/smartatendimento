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
import User from "../../models/User";

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
import { provider } from "./providers";

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
            reactionMessage: msg.message?.reactionMessage?.text || "reaction",
    };

    return types[type];
  } catch (error) {
    Sentry.setExtra("Error getTypeMessage", { msg });
    Sentry.captureException(error);
    return null;
  }
};

export const isNumeric = (value: string): boolean => {
  return /^\d+$/.test(value);
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const validaCpfCnpj = (cpfCnpj: string): boolean => {
  // Remove caracteres especiais
  const cleanCpfCnpj = cpfCnpj.replace(/[^\d]/g, '');
  
  if (cleanCpfCnpj.length === 11) {
    // Validação de CPF
    return validaCpf(cleanCpfCnpj);
  } else if (cleanCpfCnpj.length === 14) {
    // Validação de CNPJ
    return validaCnpj(cleanCpfCnpj);
  }
  
  return false;
};

const validaCpf = (cpf: string): boolean => {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;

  return true;
};

const validaCnpj = (cnpj: string): boolean => {
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

export const sendMessageImage = async (
  wbot: WASocket,
  contact: Contact,
  ticket: Ticket,
  url: string,
  caption: string
): Promise<void> => {
  try {
    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.contact.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        image: { url },
        caption: caption || ""
      }
    );
    
    await verifyMessage(sentMessage, ticket, contact);
  } catch (error) {
    logger.error(error, "Error sending image message");
  }
};

export const sendMessageLink = async (
  wbot: WASocket,
  contact: Contact,
  ticket: Ticket,
  url: string,
  filename: string
): Promise<void> => {
  try {
    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.contact.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        document: { url },
        fileName: filename,
        mimetype: "application/pdf"
      }
    );
    
    await verifyMessage(sentMessage, ticket, contact);
  } catch (error) {
    logger.error(error, "Error sending document message");
  }
};

export const makeid = (length: number): string => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const verifyRating = (ticketTraking: TicketTraking): boolean => {
  if (
    ticketTraking &&
    ticketTraking.finishedAt === null &&
    ticketTraking.userId !== null &&
    ticketTraking.ratingAt !== null &&
    !ticketTraking.rated
  ) {
    return true;
  }
  return false;
};

const getQuotedMessageId = (msg: proto.IWebMessageInfo): string | null => {
  const body = extractMessageContent(msg.message);
  return (body as any)?.contextInfo?.stanzaId || null;
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
  const mineType = msg.message?.imageMessage || msg.message?.videoMessage || msg.message?.stickerMessage || msg.message?.documentMessage;
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

    io.to(`status:${ticket.status}`).to(`ticket:${ticket.id}`).emit(`company-${ticket.companyId}-ticket`, {
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

    io.to("status:closed").emit(`company-${ticket.companyId}-ticket`, { action: "delete", ticketId: ticket.id });
    io.to(`status:${ticket.status}`).to(`ticket:${ticket.id}`).emit(`company-${ticket.companyId}-ticket`, { action: "update", ticket });
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

  // Debug: Log para verificar quantos setores estão sendo retornados
  console.log(`[DEBUG] Setores encontrados: ${queues.length}`);
  queues.forEach((queue, index) => {
    console.log(`[DEBUG] Setor ${index + 1}: ${queue.name} (ID: ${queue.id})`);
  });

  // Se não há setores cadastrados, não faz nada
  if (queues.length === 0) {
    console.log(`[DEBUG] Nenhum setor encontrado, retornando...`);
    return;
  }

  const selectedOption = getBodyMessage(msg);
  console.log(`[DEBUG] Opção selecionada pelo usuário: "${selectedOption}"`);
  
  const choosenQueue = queues.find((q, i) => i + 1 === +selectedOption);
  console.log(`[DEBUG] Setor escolhido:`, choosenQueue ? `${choosenQueue.name} (ID: ${choosenQueue.id})` : 'Nenhum');

  if (choosenQueue) {
    let chatbot = false;
    if (choosenQueue?.options) {
      chatbot = choosenQueue?.options?.length > 0;
    }
    console.log(`[DEBUG] Atribuindo setor ${choosenQueue.name} ao ticket ${ticket.id}`);
    await UpdateTicketService({ 
      ticketData: { queueId: choosenQueue.id, chatbot }, 
      ticketId: ticket.id, 
      companyId: ticket.companyId 
    });
  } else {
    // SEMPRE mostrar as opções de setores para o usuário escolher
    // Independente da quantidade de setores, o usuário deve selecionar
    console.log(`[DEBUG] Mostrando opções de setores para o usuário`);
    let options = "";
    queues.forEach((queue, index) => {
      options += `*[ ${index + 1} ]* - ${queue.name}\n`;
    });
    
    console.log(`[DEBUG] Mensagem que será enviada:`, `${greetingMessage}\n\n${options}`);
    const body = formatBody(`\u200e${greetingMessage}\n\n${options}`, contact);
    await SendWhatsAppMessage({ body, ticket });
  }
};

const handleChatbot = async (
  ticket: Ticket, 
  msg: proto.IWebMessageInfo, 
  wbot: Session, 
  dontReadTheFirstQuestion: boolean = false
): Promise<void> => {
  const queue = await Queue.findByPk(ticket.queueId, {
    include: [
      {
        model: QueueOption,
        as: "options",
        where: { parentId: null },
        order: [
          ["option", "ASC"],
          ["createdAt", "ASC"],
        ],
      },
    ],
  });

  if (ticket.queue !== null) {
    const queue = await Queue.findByPk(ticket.queueId);
    const { schedules }: any = queue;
    const now = moment();
    const weekday = now.format("dddd").toLowerCase();
    let schedule;

    if (Array.isArray(schedules) && schedules?.length > 0) {
      schedule = schedules.find((s) => s.weekdayEn === weekday && s.startTime !== "" && s.startTime !== null && s.endTime !== "" && s.endTime !== null);
    }

    if (ticket.queue.outOfHoursMessage !== null && ticket.queue.outOfHoursMessage !== "" && !isNil(schedule)) {
      const startTime = moment(schedule.startTime, "HH:mm");
      const endTime = moment(schedule.endTime, "HH:mm");

      if (now.isBefore(startTime) || now.isAfter(endTime)) {
        const body = formatBody(`${ticket.queue.outOfHoursMessage}\n\n*[ # ]* - Voltar ao Menu Principal`, ticket.contact);
        await SendWhatsAppMessage({ body, ticket });
        return;
      }

      const body = formatBody(`\u200e${ticket.queue.greetingMessage}`, ticket.contact);
      await SendWhatsAppMessage({ body, ticket });
    }
  }

  const messageBody = getBodyMessage(msg);

  if (messageBody == "#") {
    // voltar para o menu inicial
    await ticket.update({ queueOptionId: null, chatbot: false, queueId: null });
    await verifyQueue(wbot, msg, ticket, ticket.contact);
    return;
  }

  // voltar para o menu anterior
  if (!isNil(queue) && !isNil(ticket.queueOptionId) && messageBody == "#") {
    const option = await QueueOption.findByPk(ticket.queueOptionId);
    await ticket.update({ queueOptionId: option?.parentId });

    // escolheu uma opção
  } else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
    const count = await QueueOption.count({
      where: { parentId: ticket.queueOptionId },
    });
    let option: any = {};
    if (count == 1) {
      option = await QueueOption.findOne({
        where: { parentId: ticket.queueOptionId },
      });
    } else {
      option = await QueueOption.findOne({
        where: {
          option: messageBody || "",
          parentId: ticket.queueOptionId,
        },
      });
    }
    if (option) {
      await ticket.update({ queueOptionId: option?.id });
    }

    // não leu a primeira pergunta
  } else if (!isNil(queue) && isNil(ticket.queueOptionId) && !dontReadTheFirstQuestion) {
    const option = queue?.options.find((o) => o.option == messageBody);
    if (option) {
      await ticket.update({ queueOptionId: option?.id });
    }
  }

  await ticket.reload();

  if (!isNil(queue) && isNil(ticket.queueOptionId)) {
    const queueOptions = await QueueOption.findAll({
      where: { queueId: ticket.queueId, parentId: null },
      order: [
        ["option", "ASC"],
        ["createdAt", "ASC"],
      ],
    });

    const botText = async () => {
      let options = "";

      queueOptions.forEach((option, i) => {
        options += `*[ ${option.option} ]* - ${option.title}\n`;
      });
      options += `\n*[ # ]* - Voltar Menu Inicial`;

      const textMessage = formatBody(`\u200e${queue.greetingMessage}\n\n${options}`, ticket.contact);
      await SendWhatsAppMessage({ body: textMessage, ticket });
    };
    return botText();

  } else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
    const currentOption = await QueueOption.findByPk(ticket.queueOptionId);
    const queueOptions = await QueueOption.findAll({
      where: { parentId: ticket.queueOptionId },
      order: [
        ["option", "ASC"],
        ["createdAt", "ASC"],
      ],
    });

    if (queueOptions?.length > 1) {
      const botText = async () => {
        let options = "";

        queueOptions.forEach((option, i) => {
          options += `*[ ${option.option} ]* - ${option.title}\n`;
        });
        options += `\n*[ # ]* - Voltar Menu Inicial`;

        const body = formatBody(`\u200e${currentOption.message}\n\n${options}`, ticket.contact);
        await SendWhatsAppMessage({ body, ticket });
      };

      return botText();
    }
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

    const hasMedia = msg.message?.imageMessage || msg.message?.videoMessage || msg.message?.documentMessage || msg.message.stickerMessage;

    if (hasMedia) {
      await verifyMediaMessage(msg, ticket, contact);
    } else {
      await verifyMessage(msg, ticket, contact);
    }

    if (!ticket.queue && !isGroup && !msg.key.fromMe && !ticket.userId && whatsapp.queues.length >= 1) {
      await verifyQueue(wbot, msg, ticket, contact);
    }

    // Reload ticket to get updated queue information
    await ticket.reload({
      include: [{ model: Queue, as: "queue" }, { model: User, as: "user" }, { model: Contact, as: "contact" }]
    });

    const dontReadTheFirstQuestion = ticket.queue === null;

    // Handle chatbot logic for queues with options
    if (ticket.queue && ticket.chatbot && !msg.key.fromMe) {
      await handleChatbot(ticket, msg, wbot, dontReadTheFirstQuestion);
    }

    // Handle provider logic for automated responses (like boleto, etc.)
    if (ticket.queue && !msg.key.fromMe) {
      await provider(ticket, msg, companyId, contact, wbot as WASocket);
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