import express from "express";
import { searchUsers, updatePreferredLanguage } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";


const router = express.Router();

router.get("/search", protectRoute, searchUsers);

router.patch("/preferences", protectRoute, updatePreferredLanguage);

export default router;
