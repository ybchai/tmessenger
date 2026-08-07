import express from "express";
import http from "http";
import { Server } from "socket.io";

import { socketAuth } from "./auth.socket.js";
import { registerConversationSocket } from "./conversation.socket.js";
import { registerMessageSocket } from "./message.socket.js";

const app = express();

const server = http.createServer(app);

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.FRONTEND_URL]
    : ["http://localhost:5173"];

console.log("Socket CORS:", allowedOrigins);

const io = new Server(server, {
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

const userSocketMap = new Map();

io.on("connection", (socket)=>{

  const userId = socket.user.id;

  userSocketMap.set(userId, socket.id);


  socket.on("disconnect",()=>{
    userSocketMap.delete(userId);
  });

});

export { app, server, io, userSocketMap };
