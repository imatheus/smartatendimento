import { Op, fn, where, col, Filterable, Includeable, literal } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import User from "../../models/User";
import ShowUserService from "../UserServices/ShowUserService";
import Tag from "../../models/Tag";
import TicketTag from "../../models/TicketTag";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  updatedAt?: string;
  showAll?: string;
  userId: string;
  withUnreadMessages?: string;
  queueIds: (number | string)[];
  tags: number[];
  users: number[];
  companyId: number;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  queueIds,
  tags,
  users,
  status,
  date,
  updatedAt,
  showAll,
  userId,
  withUnreadMessages,
  companyId
}: Request): Promise<Response> => {
  // Separar queueIds numéricos de "no-queue"
  const numericQueueIds = queueIds.filter(id => typeof id === 'number' || (typeof id === 'string' && id !== 'no-queue')).map(id => Number(id));
  const includeNoQueue = queueIds.includes('no-queue');
  
  // Construir condição de queue baseada na presença de "no-queue"
  let queueCondition;
  if (includeNoQueue && numericQueueIds.length > 0) {
    queueCondition = { 
      [Op.or]: [
        { [Op.in]: numericQueueIds }, 
        { [Op.is]: null }
      ] 
    };
  } else if (includeNoQueue) {
    queueCondition = { [Op.is]: null };
  } else if (numericQueueIds.length > 0) {
    queueCondition = { [Op.in]: numericQueueIds };
  } else {
    queueCondition = null;
  }

  let whereCondition: Filterable["where"] = {
    [Op.or]: [{ userId }, { status: "pending" }]
  };
  
  if (queueCondition !== null) {
    (whereCondition as any).queueId = queueCondition;
  }

  // Otimização: Incluir apenas campos necessários
  let includeCondition: Includeable[] = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "email", "profilePicUrl"]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name"]
    },
    {
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color"]
    },
    {
      model: Whatsapp,
      as: "whatsapp",
      attributes: ["name"]
    },
  ];

  if (showAll === "true") {
    if (queueCondition !== null) {
      whereCondition = { queueId: queueCondition };
    } else {
      whereCondition = {};
    }
  }

  if (status) {
    whereCondition = {
      ...whereCondition,
      status
    };
  }

  if (searchParam) {
    const sanitizedSearchParam = searchParam.toLocaleLowerCase().trim();

    // Otimização: Incluir mensagens apenas quando necessário
    includeCondition = [
      ...includeCondition,
      {
        model: Message,
        as: "messages",
        attributes: ["id", "body"],
        where: {
          body: where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        required: false,
        duplicating: false
      }
    ];

    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          "$contact.name$": where(
            fn("LOWER", col("contact.name")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
        {
          "$message.body$": where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        }
      ]
    };
  }

  if (date) {
    whereCondition = {
      ...whereCondition,
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      }
    };
  }

  if (updatedAt) {
    whereCondition = {
      ...whereCondition,
      updatedAt: {
        [Op.between]: [
          +startOfDay(parseISO(updatedAt)),
          +endOfDay(parseISO(updatedAt))
        ]
      }
    };
  }

  if (withUnreadMessages === "true") {
    const user = await ShowUserService(userId);
    const userQueueIds = user.queues.map(queue => queue.id);

    let userQueueCondition;
    if (userQueueIds.length > 0) {
      userQueueCondition = { [Op.or]: [{ [Op.in]: userQueueIds }, { [Op.is]: null }] };
    } else {
      userQueueCondition = { [Op.is]: null };
    }

    whereCondition = {
      [Op.or]: [{ userId }, { status: "pending" }],
      queueId: userQueueCondition,
      unreadMessages: { [Op.gt]: 0 }
    };
  }

  // Otimização: Filtro de tags usando EXISTS ao invés de múltiplas queries
  if (Array.isArray(tags) && tags.length > 0) {
    whereCondition = {
      ...whereCondition,
      [Op.and]: [
        literal(`EXISTS (
          SELECT 1 FROM "TicketTags" tt 
          WHERE tt."ticketId" = "Ticket"."id" 
          AND tt."tagId" IN (${tags.join(',')})
        )`)
      ]
    };
  }

  // Otimização: Filtro direto de usuários
  if (Array.isArray(users) && users.length > 0) {
    whereCondition = {
      ...whereCondition,
      userId: {
        [Op.in]: users
      }
    };
  }

  const limit = 40;
  const offset = limit * (+pageNumber - 1);

  whereCondition = {
    ...whereCondition,
    companyId
  };

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    distinct: true,
    limit,
    offset,
    order: [["updatedAt", "DESC"]],
    subQuery: false
  });

  const hasMore = count > offset + tickets.length;

  return {
    tickets,
    count,
    hasMore
  };
};

export default ListTicketsService;