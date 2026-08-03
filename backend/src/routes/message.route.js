import express from "express";

import { getMessages, sendMessage } from "./message.controller.js";

import { protectRoute } from "../auth/auth.middleware.js";

import { upload } from "../../shared/upload.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/:id", getMessages);

router.post("/:id", upload.single("media"), sendMessage);

export default router;
