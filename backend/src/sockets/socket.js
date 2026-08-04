import { Server } from "socket.io";

import { socketAuth } from "../sockets/auth.socket.js";
import { registerConversationSocket } from "../sockets/conversation.socket.js";
import { registerMessageSocket } from "../sockets/message.socket.js";

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  // Authenticate socket connection
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.user.id);

    // Conversation events
    registerConversationSocket(io, socket);

    // Message events
    registerMessageSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.user.id);
    });
  });

  return io;
}
