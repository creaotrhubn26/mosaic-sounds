import { Router, type IRouter } from "express";
import { getAllOverrides, runYouTubeIdFixCron } from "../lib/youtube-id-fix";

const router: IRouter = Router();

// Public read endpoint — mobile fetches this at startup to overlay corrected
// YouTube IDs on top of the hard-coded data.ts catalog.
router.get("/song-overrides", async (_req, res) => {
  try {
    const overrides = await getAllOverrides();
    res.set("cache-control", "public, max-age=300, s-maxage=300");
    res.json({ overrides });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// Triggered by Vercel Cron daily. Protected by CRON_SECRET so direct hits don't burn quota.
// Vercel sets `authorization: Bearer <CRON_SECRET>` on cron-initiated invocations when the
// env var is set on the project.
router.post("/internal/youtube-id-fix-cron", async (req, res) => {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) {
    res.status(500).json({ error: "CRON_SECRET not configured" });
    return;
  }
  const auth = req.header("authorization") ?? "";
  if (auth !== `Bearer ${expected}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const result = await runYouTubeIdFixCron();
    req.log.info(result, "youtube-id-fix-cron completed");
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    req.log.error({ error }, "youtube-id-fix-cron failed");
    res.status(500).json({ error: message });
  }
});

export default router;
