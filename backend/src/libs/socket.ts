import { Server as SocketIOServer } from "socket.io";
import { Server } from "http";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import User from "../models/User";

let io: SocketIOServer;

export const initIO = (httpServer: Server): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    transports: ["websocket"], // Force WebSocket transport
    cors: {
      origin: process.env.FRONTEND_URL || "*", // Fallback to allow all origins if FRONTEND_URL is not set
      methods: ["GET", "POST"], // Explicitly allow methods
      credentials: true, // Allow credentials if needed
    },
    pingTimeout: 20000, // Increase timeout to handle network delays
    pingInterval: 25000, // Regular ping to keep connection alive
  });

  io.on("connection", async (socket) => {
    const { userId, companyId } = socket.handshake.query;
    
    if (userId && userId !== "undefined" && userId !== "null") {
      try {
        const user = await User.findByPk(userId as string);
        if (user) {
          user.online = true;
          await user.save();
          socket.join(`user:${userId}`);
          logger.info(`User ${user.name} (ID: ${userId}) connected`);
        }
      } catch (err) {
        logger.error(err, `Error connecting user ${userId}`);
      }
    } else {
      logger.info(`Anonymous client connected`);
    }

    socket.on("joinChatBox", (ticketId: string) => {
      socket.join(`ticket:${ticketId}`);
      logger.info(`Client joined ticket chat ${ticketId}`);
    });

    socket.on("joinNotification", () => {
      socket.join("notification");
      logger.info(`Client connected to notifications`);
    });

    socket.on("joinTickets", (status: string) => {
      socket.join(`status:${status}`);
      logger.info(`Client connected to ${status} tickets`);
    });

    socket.on("disconnect", async () => {
      if (userId && userId !== "undefined" && userId !== "null") {
        try {
          const user = await User.findByPk(userId as string);
          if (user) {
            user.online = false;
            await user.save();
            logger.info(`User ${user.name} (ID: ${userId}) disconnected`);
          }
        } catch (err) {
          logger.error(err, `Error disconnecting user ${userId}`);
        }
      } else {
        logger.info(`Anonymous client disconnected`);
      }
    });

    socket.on("error", (error) => {
      logger.error(error, `Socket error for client: ${socket.id}`);
    });
  });

  io.on("connect_error", (error) => {
    logger.error(error, "Socket.IO connection error");
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new AppError("Socket IO not initialized");
  }
  return io;
};