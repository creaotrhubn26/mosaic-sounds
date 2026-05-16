import { Router } from "express";
import { z } from "zod";

const router = Router();

const PushTokenSchema = z.object({
  clientId: z.string(),
  token: z.string(),
  platform: z.enum(["ios", "android", "web"]).optional(),
});

const pushTokenStore = new Map<string, { token: string; platform?: string; updatedAt: string }>();

router.post("/push/register", async (req, res) => {
  const parsed = PushTokenSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }
  const { clientId, token, platform } = parsed.data;
  pushTokenStore.set(clientId, { token, platform, updatedAt: new Date().toISOString() });
  return res.json({ ok: true });
});

router.delete("/push/register/:clientId", (req, res) => {
  pushTokenStore.delete(req.params.clientId);
  res.json({ ok: true });
});

export async function sendPushNotification(params: {
  clientId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<boolean> {
  const stored = pushTokenStore.get(params.clientId);
  if (!stored) return false;

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        to: stored.token,
        title: params.title,
        body: params.body,
        data: params.data ?? {},
        sound: "default",
        priority: "high",
      }),
    });
    const result = await response.json() as { data?: { status?: string } };
    return result?.data?.status === "ok";
  } catch (err) {
    console.warn("Push notification failed:", err);
    return false;
  }
}

export default router;
