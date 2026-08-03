import express from "express";
import { verifyWebhook } from "@clerk/backend/webhooks";

import {
  upsertUser,
  deactivateUserByClerkId,
} from "../repositories/user.repository.js";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("CLERK WEBHOOK HIT");

  try {
    const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    console.log({
      secretExists: Boolean(process.env.CLERK_WEBHOOK_SIGNING_SECRET),
      secretStart: process.env.CLERK_WEBHOOK_SIGNING_SECRET?.slice(0, 10),
    });

    console.log({
      secretExists: Boolean(signingSecret),
      svixId: req.headers["svix-id"],
      svixSignature: req.headers["svix-signature"],
      svixTimestamp: req.headers["svix-timestamp"],
      bodyType: typeof req.body,
      isBuffer: Buffer.isBuffer(req.body),
    });

    if (!signingSecret) {
      return res.status(503).json({
        message: "Webhook secret is not provided",
      });
    }

    const request = new Request("http://internal/webhooks/clerk", {
      method: "POST",
      headers: new Headers(req.headers),
      body: Buffer.isBuffer(req.body) ? req.body : JSON.stringify(req.body),
    });

    const evt = await verifyWebhook(request, {
      signingSecret,
    });

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const u = evt.data;

      const email =
        u.email_addresses?.find((e) => e.id === u.primary_email_address_id)
          ?.email_address ?? u.email_addresses?.[0]?.email_address;

      const fullName =
        [u.first_name, u.last_name].filter(Boolean).join(" ") ||
        u.username ||
        email?.split("@")[0];

      await upsertUser({
        clerkId: u.id,
        email,
        fullName,
        profilePic: u.image_url ?? "",
      });
    }

    if (evt.type === "user.deleted") {
      await deactivateUserByClerkId(evt.data.id);
    }

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error("Error in Clerk webhook:", error);

    return res.status(400).json({
      message: "Webhook verification failed",
    });
  }
});

export default router;
