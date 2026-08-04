import express from "express";
import http from "http";
import { Server } from "socket.io";

import { socketAuth } from "./auth.socket.js";
import { registerConversationSocket } from "./conversation.socket.js";
import { registerMessageSocket } from "./message.socket.js";

export const app = express();

export const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  "https://tmessenger.onrender.com"
];


export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.use(socketAuth);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.user.id);

  registerConversationSocket(io, socket);

  registerMessageSocket(io, socket);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.user.id);
  });
});
