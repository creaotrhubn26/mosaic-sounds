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

export default app;
