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
    logger.info(`Client Connected: ${socket.id}`);
    const { userId, companyId } = socket.handshake.query;

    if (userId && userId !== "undefined" && userId !== "null") {
      try {
        const user = await User.findByPk(userId as string);
        if (user) {
          user.online = true;
          await user.save();
          socket.join(`user:${userId}`); // Join user-specific room for targeted events
          logger.info(`User ${userId} marked as online`);
        }
      } catch (err) {
        logger.error(err, `Error updating user online status for userId: ${userId}`);
      }
    }

    socket.on("joinChatBox", (ticketId: string) => {
      logger.info(`Client joined ticket channel: ${ticketId}`);
      socket.join(`ticket:${ticketId}`);
    });

    socket.on("joinNotification", () => {
      logger.info("Client joined notification channel");
      socket.join("notification");
    });

    socket.on("joinTickets", (status: string) => {
      logger.info(`Client joined ${status} tickets channel`);
      socket.join(`status:${status}`);
    });

    socket.on("disconnect", async () => {
      logger.info(`Client disconnected: ${socket.id}`);
      if (userId && userId !== "undefined" && userId !== "null") {
        try {
          const user = await User.findByPk(userId as string);
          if (user) {
            user.online = false;
            await user.save();
            logger.info(`User ${userId} marked as offline`);
          }
        } catch (err) {
          logger.error(err, `Error updating user offline status for userId: ${userId}`);
        }
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