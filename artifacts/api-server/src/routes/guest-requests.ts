import { Router, type IRouter } from "express";
import { sendPushNotification } from "./push";

const router: IRouter = Router();

type GuestRequest = {
  id: string;
  sessionId: string;
  guestName: string;
  song: string;
  artist?: string;
  createdAt: number;
};

type Session = {
  open: boolean;
  requests: GuestRequest[];
  ownerClientId?: string;
};

const store = new Map<string, Session>();

const MAX_PER_SESSION = 200;

function getSession(sessionId: string): Session {
  if (!store.has(sessionId)) store.set(sessionId, { open: true, requests: [] });
  return store.get(sessionId)!;
}

function pruneOld() {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  store.forEach((session, sid) => {
    const kept = session.requests.filter((r) => r.createdAt > cutoff);
    if (kept.length === 0 && session.open) store.delete(sid);
    else session.requests = kept;
  });
}

// Get requests + open status
router.get("/guest-requests/:sessionId", (req, res) => {
  const session = getSession(req.params.sessionId);
  res.json({ open: session.open, requests: session.requests });
});

// Register owner client ID for push notifications
router.put("/guest-requests/:sessionId/owner", (req, res) => {
  const session = getSession(req.params.sessionId);
  const { clientId } = req.body ?? {};
  if (clientId) session.ownerClientId = String(clientId);
  res.json({ ok: true });
});

// Toggle open/closed
router.patch("/guest-requests/:sessionId/open", (req, res) => {
  const session = getSession(req.params.sessionId);
  const { open } = req.body ?? {};
  session.open = Boolean(open);
  res.json({ ok: true, open: session.open });
});

// Submit a request
router.post("/guest-requests", async (req, res) => {
  const { sessionId, guestName, song, artist } = req.body ?? {};
  if (!sessionId || !song) {
    res.status(400).json({ error: "sessionId and song are required" });
    return;
  }
  pruneOld();
  const session = getSession(sessionId);
  if (!session.open) {
    res.status(403).json({ error: "Requests are currently closed" });
    return;
  }
  if (session.requests.length >= MAX_PER_SESSION) {
    res.status(429).json({ error: "Request limit reached" });
    return;
  }
  const item: GuestRequest = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sessionId,
    guestName: String(guestName || "Guest").slice(0, 60),
    song: String(song).slice(0, 100),
    artist: artist ? String(artist).slice(0, 80) : undefined,
    createdAt: Date.now(),
  };
  session.requests.push(item);

  // Push notification to owner
  if (session.ownerClientId) {
    void sendPushNotification({
      clientId: session.ownerClientId,
      title: `🎵 New song request`,
      body: `${item.guestName} requested: ${item.song}${item.artist ? ` — ${item.artist}` : ""}`,
      data: { type: "guest_request", sessionId, requestId: item.id },
    });
  }

  res.json({ ok: true, id: item.id });
});

// Dismiss a single request
router.delete("/guest-requests/:sessionId/:id", (req, res) => {
  const { sessionId, id } = req.params;
  const session = getSession(sessionId);
  session.requests = session.requests.filter((r) => r.id !== id);
  res.json({ ok: true });
});

export default router;
