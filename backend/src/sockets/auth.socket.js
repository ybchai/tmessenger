import { verifyToken } from "@clerk/backend";

import { findUserByClerkId } from "../repositories/user.repository.js";

export async function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    const session = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const user = await findUserByClerkId(session.sub);

    if (!user) {
      return next(new Error("User not found"));
    }

    // Attach database user

    socket.user = user;

    next();
  } catch (error) {
    console.error("Socket authentication error:", error);

    next(new Error("Unauthorized"));
  }
}
