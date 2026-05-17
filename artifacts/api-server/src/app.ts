import express, { type Express } from "express";
import cors, { type CorsOptionsDelegate } from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import clerkWebhookRouter from "./routes/clerk-webhook";
import { logger } from "./lib/logger";

const app: Express = express();

const extraAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string | undefined): boolean {
  // Native mobile apps and same-origin server-to-server calls don't send an Origin header.
  if (!origin) return true;

  if (extraAllowedOrigins.includes(origin)) return true;

  let hostname: string;
  try {
    hostname = new URL(origin).hostname;
  } catch {
    return false;
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  if (hostname.endsWith(".vercel.app")) return true;
  if (hostname.endsWith(".replit.dev") || hostname.endsWith(".replit.app")) return true;

  return false;
}

const corsDelegate: CorsOptionsDelegate = (req, callback) => {
  const origin = req.headers["origin"];
  const originValue = Array.isArray(origin) ? origin[0] : origin;
  callback(null, { origin: isAllowedOrigin(originValue ?? undefined), credentials: true });
};

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors(corsDelegate));

// Clerk webhook needs the raw request body for Svix signature verification, so it
// must be registered before the global JSON parser.
app.use("/api", clerkWebhookRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Friendly root response so people poking the deployment URL in a browser see
// something useful instead of "Cannot GET /".
app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Mosaic Beats API</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; background: #0F0708; color: #FAF0E6; margin: 0; padding: 48px 24px; max-width: 720px; margin-inline: auto; }
    h1 { color: #D4A017; font-weight: 600; margin: 0 0 8px; }
    p { color: #B8A89E; margin: 0 0 24px; }
    h2 { color: #FAF0E6; font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em; margin: 32px 0 12px; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { padding: 10px 14px; background: #1A0B0C; border-radius: 8px; margin-bottom: 6px; font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 13px; }
    .method { display: inline-block; min-width: 48px; color: #D4A017; }
  </style>
</head>
<body>
  <h1>Mosaic Beats API</h1>
  <p>Backend for the Mosaic Beats mobile + DJ Dashboard apps. This URL is not meant to be browsed directly.</p>

  <h2>Public endpoints</h2>
  <ul>
    <li><span class="method">GET</span> /api/healthz</li>
    <li><span class="method">GET</span> /api/album-art?artist=&amp;title=</li>
    <li><span class="method">GET</span> /api/song-preview?title=&amp;artist=</li>
    <li><span class="method">GET</span> /api/song-overrides</li>
  </ul>

  <h2>Auth-gated</h2>
  <ul>
    <li><span class="method">GET</span> /api/auth/session</li>
    <li><span class="method">POST</span> /api/auth/sync</li>
    <li><span class="method">GET/PUT</span> /api/app-state</li>
    <li><span class="method">GET</span> /api/youtube/status</li>
    <li><span class="method">POST</span> /api/youtube/start</li>
    <li><span class="method">POST</span> /api/youtube/playlists</li>
  </ul>
</body>
</html>`);
});

export default app;
