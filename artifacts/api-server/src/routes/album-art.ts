import { Router, type IRouter } from "express";
import { lookupAlbumArt } from "../lib/album-art";

const router: IRouter = Router();

router.get("/album-art", async (req, res) => {
  try {
    const artist = typeof req.query.artist === "string" ? req.query.artist : "";
    const title = typeof req.query.title === "string" ? req.query.title : "";
    if (!artist.trim() || !title.trim()) {
      res.status(400).json({ error: "artist and title query params are required" });
      return;
    }

    const result = await lookupAlbumArt(artist, title);
    if (result.cached) res.setHeader("x-album-art-cache", "hit");
    else res.setHeader("x-album-art-cache", "miss");

    res.json({
      artist,
      title,
      artworkUrl: result.artworkUrl,
      source: result.source,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

router.post("/album-art/batch", async (req, res) => {
  try {
    const body = req.body;
    const items = Array.isArray(body?.items) ? body.items : [];
    if (items.length === 0 || items.length > 100) {
      res.status(400).json({ error: "items must be a non-empty array up to 100 entries" });
      return;
    }

    const results = [];
    for (const item of items) {
      const artist = typeof item?.artist === "string" ? item.artist : "";
      const title = typeof item?.title === "string" ? item.title : "";
      if (!artist.trim() || !title.trim()) {
        results.push({ artist, title, artworkUrl: null, source: "invalid", cached: false });
        continue;
      }
      const r = await lookupAlbumArt(artist, title);
      results.push({ artist, title, ...r });
    }

    res.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
