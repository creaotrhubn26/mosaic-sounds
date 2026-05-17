import { Router, type IRouter } from "express";
import { PreviewRateLimitError, resolveSongPreview } from "../lib/song-preview";

const router: IRouter = Router();

router.get("/song-preview", async (req, res) => {
  const title = typeof req.query.title === "string" ? req.query.title.trim() : "";
  const artist = typeof req.query.artist === "string" ? req.query.artist.trim() : "";

  if (!title) {
    res.status(400).json({ error: "Song title is required" });
    return;
  }

  try {
    const preview = await resolveSongPreview({ title, artist });
    if (!preview) {
      res.json({
        previewUrl: null,
        artworkUrl: null,
        durationMs: null,
        matchedTitle: null,
        matchedArtist: null,
        confidence: null,
      });
      return;
    }

    res.json(preview);
  } catch (error) {
    if (error instanceof PreviewRateLimitError) {
      // Tell the client iTunes is rate-limiting us so it can retry later instead of
      // treating this as a permanent failure.
      res.set("Retry-After", "30");
      res.status(503).json({ error: "Preview lookup temporarily unavailable, retry shortly" });
      return;
    }
    req.log.warn({ error, title, artist }, "Could not resolve song preview");
    res.status(502).json({ error: "Could not resolve song preview" });
  }
});

export default router;
