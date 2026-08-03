import { getAuth } from "@clerk/express";
import { findUserByClerkId } from "../repositories/user.repository.js";

export async function protectRoute(req, res, next) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const user = await findUserByClerkId(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    res.status(500).json({
      error: "Internal server error",
    });
  }
}
