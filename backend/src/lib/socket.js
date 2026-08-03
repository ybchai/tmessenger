import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,

    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);

    console.log(
      `${socket.id}
                    joined conversation
                    ${conversationId}`,
    );
  });

  socket.on("leaveConversation", (conversationId) => {
    socket.leave(conversationId);

    console.log(
      `${socket.id}
                    left conversation
                    ${conversationId}`,
    );
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

export { app, server, io };
