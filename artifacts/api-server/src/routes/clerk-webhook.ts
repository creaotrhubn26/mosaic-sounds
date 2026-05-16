import { Router, type IRouter, type Request, type Response } from "express";
import express from "express";
import { Webhook } from "svix";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

type ClerkUserDeletedEvent = {
  type: "user.deleted";
  data: { id?: string; deleted?: boolean };
};

type ClerkUserCreatedEvent = {
  type: "user.created";
  data: { id?: string };
};

type ClerkEvent = ClerkUserDeletedEvent | ClerkUserCreatedEvent | { type: string; data: unknown };

async function deleteAccountData(accountId: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("delete from mosaic_beats.youtube_connections where account_id = $1", [accountId]);
    await client.query("delete from mosaic_beats.account_profiles where account_id = $1", [accountId]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

router.post(
  "/clerk/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET?.trim();
    if (!secret) {
      logger.error("CLERK_WEBHOOK_SIGNING_SECRET is not set");
      res.status(500).json({ error: "Webhook signing secret is not configured" });
      return;
    }

    const svixId = req.header("svix-id");
    const svixTimestamp = req.header("svix-timestamp");
    const svixSignature = req.header("svix-signature");
    if (!svixId || !svixTimestamp || !svixSignature) {
      res.status(400).json({ error: "Missing Svix headers" });
      return;
    }

    const rawBody = req.body instanceof Buffer ? req.body.toString("utf8") : "";

    let event: ClerkEvent;
    try {
      const wh = new Webhook(secret);
      event = wh.verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkEvent;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid Svix signature";
      logger.warn({ err: message }, "Clerk webhook signature verification failed");
      res.status(400).json({ error: message });
      return;
    }

    try {
      if (event.type === "user.deleted") {
        const data = event.data as ClerkUserDeletedEvent["data"];
        const userId = typeof data.id === "string" ? data.id.trim() : "";
        if (userId) {
          await deleteAccountData(userId);
          logger.info({ accountId: userId }, "Cleaned up profile + youtube data for deleted Clerk user");
        }
      }

      res.json({ ok: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Webhook handler failed";
      logger.error({ err: message, eventType: event.type }, "Clerk webhook handler failed");
      res.status(500).json({ error: message });
    }
  },
);

export default router;
