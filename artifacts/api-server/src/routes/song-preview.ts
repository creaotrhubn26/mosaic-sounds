import { Router, type IRouter } from "express";
import { resolveSongPreview } from "../lib/song-preview";

const router: IRouter = Router();

router.get("/song-preview", async (req, res) => {
  const title = typeof req.query.title === "string" ? req.query.title.trim() : "";
  const artist = typeof req.query.artist === "string" ? req.query.artist.trim() : "";

  if (!title) {
    return res.status(400).json({ error: "Song title is required" });
  }

  try {
    const preview = await resolveSongPreview({ title, artist });
    if (!preview) {
      return res.json({
        previewUrl: null,
        artworkUrl: null,
        durationMs: null,
        matchedTitle: null,
        matchedArtist: null,
        confidence: null,
      });
    }

    return res.json(preview);
  } catch (error) {
    req.log.warn({ error, title, artist }, "Could not resolve song preview");
    return res.status(502).json({ error: "Could not resolve song preview" });
  }
});

export default router;
