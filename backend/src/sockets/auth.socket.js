import { verifyToken } from "@clerk/backend";

import { findUserByClerkId } from "../repositories/user.repository.js";

export async function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth.token;

    console.log("Socket auth attempt - token present:", !!token);

    if (!token) {
      console.log("Socket auth failed: token missing");
      return next(new Error("Authentication token missing"));
    }

    console.log("Verifying Clerk token...");
    const session = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    console.log("Token verified, session sub:", session.sub);

    const user = await findUserByClerkId(session.sub);

    if (!user) {
      console.log(
        "Socket auth failed: user not found for clerk id:",
        session.sub,
      );
      return next(new Error("User not found"));
    }

    console.log("Socket auth successful for user:", user.id);

    // Attach database user

    socket.user = user;

    next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    console.error("Error details:", error);

    next(new Error("Unauthorized"));
  }
}
