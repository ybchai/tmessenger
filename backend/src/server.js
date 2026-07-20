import express from "express";
import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
const FRONTEND_URL = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};
app.use(cors(FRONTEND_URL));
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Example app listening on port ${PORT}`);
});
