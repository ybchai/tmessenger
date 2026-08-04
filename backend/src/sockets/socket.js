import express from "express";
import http from "http";
import { Server } from "socket.io";

import { socketAuth } from "./auth.socket.js";
import { registerConversationSocket } from "./conversation.socket.js";
import { registerMessageSocket } from "./message.socket.js";

const app = express();

const server = http.createServer(app);

const allowedOrigins = ["http://localhost:5173" || process.env.FRONTEND_URL];

const io = new Server(server, {
  cors: {
    origin: [allowedOrigins],
  },

  transports: ["websocket", "polling"],
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

io.engine.on("connection_error", (err)=>{
    console.log("SOCKET ERROR");
    console.log(err.message);
    console.log(err.context);
});

export { app, server, io };
