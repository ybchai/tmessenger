import express from "express";
import cors from "cors";

import "dotenv/config";

import fs from "fs";
import path from "path";

import { clerkMiddleware } from "@clerk/express";
import { connectDB } from "./lib/db.js";
import job from "./lib/cron.js";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
const FRONTEND_URL = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

const publicDir = path.join(process.cwd(), "public");

app.use(cors(FRONTEND_URL));
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (req, res,next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

app.listen(PORT, () => {
  connectDB();
  console.log(`Example app listening on port ${PORT}`);

  if (process.env.NODE_ENV === "production") {
    job.start();
  }
});
