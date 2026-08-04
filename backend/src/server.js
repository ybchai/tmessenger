import express from "express";
import cors from "cors";

import "dotenv/config";

import fs from "fs";
import path from "path";

import { clerkMiddleware } from "@clerk/express";

import { pool, query } from "./database/connection.js";
import job from "./lib/cron.js";

import clerkWebhook from "./webhooks/clerk.webhook.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import conversationRoutes from "./routes/conversation.route.js";
import userRoutes from "./routes/user.route.js";
import { app, server } from "./sockets/socket.js";

const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

const publicDir = path.join(process.cwd(), "public");

// CORS
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

// Clerk Webhooks
app.use(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhook,
);
// normal JSON parser
app.use(express.json());
// Clerk middleware
app.use(clerkMiddleware());

// health check
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// if the public directory exists, serve the static files
// this is for the production build
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

server.listen(PORT, async () => {
  try {
    await pool.query("SELECT 1");

    console.log("Database connected successfully");
    console.log("Server is up and running on PORT:", PORT);

    if (process.env.NODE_ENV === "production") {
      job.start();
    }
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
});
