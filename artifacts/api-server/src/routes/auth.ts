import { Router, type IRouter } from "express";
import {
  AuthenticationError,
  getAccountFromAuthorizationHeader,
} from "../lib/auth";
import {
  InvalidRequestError,
  mergeClientStateIntoAccount,
  resolveClientId,
  saveClientAppState,
} from "../lib/app-state";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/auth/session", async (req, res) => {
  try {
    const account = await getAccountFromAuthorizationHeader(req.header("authorization") ?? undefined);
    if (!account) {
      res.status(401).json({ error: "Missing authorization header" });
      return;
    }

    res.json(account);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const statusCode = error instanceof AuthenticationError ? 401 : 500;
    res.status(statusCode).json({ error: message });
  }
});

// Called by the client immediately after a Clerk sign-in completes. Merges the anon
// client_profile (keyed by the X-Client-Id header) into the authenticated account_profile
// (keyed by the Clerk user ID), so progress made while signed out is not lost.
router.post("/auth/sync", async (req, res) => {
  try {
    const account = await getAccountFromAuthorizationHeader(req.header("authorization") ?? undefined);
    if (!account) {
      res.status(401).json({ error: "Missing authorization header" });
      return;
    }

    const clientId = resolveClientId(req.header("x-client-id") ?? undefined);
    const client = await pool.connect();

    try {
      await client.query("begin");
      const mergedState = await mergeClientStateIntoAccount(account.accountId, clientId, client);
      await saveClientAppState(clientId, mergedState, client);
      await client.query("commit");

      res.json({
        clientId,
        accountId: account.accountId,
        email: account.email,
        state: mergedState,
      });
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      res.status(400).json({ error: error.message });
      return;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    const statusCode = error instanceof AuthenticationError ? 401 : 500;
    res.status(statusCode).json({ error: message });
  }
});

// Sign-out is handled by Clerk on the client. Kept as a no-op for backwards compatibility.
router.post("/auth/logout", (_req, res) => {
  res.json({ ok: true });
});

export default router;
