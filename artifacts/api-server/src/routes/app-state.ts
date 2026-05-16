import { Router, type IRouter, type Request } from "express";
import {
  getOrCreateAccountAppState,
  getOrCreateClientAppState,
  InvalidRequestError,
  resolveClientId,
  saveAccountAppState,
  saveClientAppState,
} from "../lib/app-state";
import {
  AuthenticationError,
  getAccountFromAuthorizationHeader,
} from "../lib/auth";

const router: IRouter = Router();

async function resolveProfileScope(req: Request) {
  const authorizationHeader = req.header("authorization") ?? undefined;
  if (authorizationHeader) {
    const account = await getAccountFromAuthorizationHeader(authorizationHeader);
    if (!account) {
      throw new AuthenticationError("Invalid or expired session");
    }

    return {
      kind: "account" as const,
      account,
      clientId: resolveClientId(req.header("x-client-id") ?? undefined),
    };
  }

  return {
    kind: "client" as const,
    clientId: resolveClientId(req.header("x-client-id") ?? undefined),
  };
}

router.get("/app-state", async (req, res) => {
  try {
    const scope = await resolveProfileScope(req);

    if (scope.kind === "account") {
      const state = await getOrCreateAccountAppState(scope.account.accountId);
      res.json({
        clientId: scope.clientId,
        accountId: scope.account.accountId,
        email: scope.account.email,
        state,
      });
      return;
    }

    const state = await getOrCreateClientAppState(scope.clientId);
    res.json({ clientId: scope.clientId, state });
  } catch (error) {
    if (error instanceof InvalidRequestError || error instanceof AuthenticationError) {
      res.status(error instanceof AuthenticationError ? 401 : 400).json({ error: error.message });
      return;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

router.put("/app-state", async (req, res) => {
  try {
    const scope = await resolveProfileScope(req);

    if (scope.kind === "account") {
      const state = await saveAccountAppState(scope.account.accountId, req.body ?? {});
      res.json({
        clientId: scope.clientId,
        accountId: scope.account.accountId,
        email: scope.account.email,
        state,
      });
      return;
    }

    const state = await saveClientAppState(scope.clientId, req.body ?? {});
    res.json({ clientId: scope.clientId, state });
  } catch (error) {
    if (error instanceof InvalidRequestError || error instanceof AuthenticationError) {
      res.status(error instanceof AuthenticationError ? 401 : 400).json({ error: error.message });
      return;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
