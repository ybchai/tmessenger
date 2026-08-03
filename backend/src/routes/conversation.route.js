import express from "express";

import {
  createOrGetConversation,
  getConversations,
  getParticipants,
} from "./controllers/conversation.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create or open DM

router.post("/", protectRoute, createOrGetConversation);

// Sidebar

router.get("/", protectRoute, getConversations);

// Conversation users

router.get("/:id/participants", protectRoute, getParticipants);

export default router;
