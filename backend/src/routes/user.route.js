import express from "express";
import { getUsers } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/search", protectRoute, getUsers);

export default router;
