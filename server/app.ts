// server/app.ts

import express from "express";
import type { Express } from "express";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { Database } from "./store/database.js";
import { requireAuth } from "./middleware/auth.js";
import { registerAllRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";

export async function createApp(db?: Database): Promise<{ app: Express; db: Database }> {
  const database = db ?? (await Database.create());
  const app = express();

  // Trust Railway's reverse proxy so Express sees the real client IP
  // from X-Forwarded-For headers (required for rate limiting to work correctly)
  app.set("trust proxy", 1);

  // 1. JSON parser
  app.use(express.json({ limit: "60mb" }));

  // 2. Security middleware
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  // 3. Rate limiting — skip health checks, use real client IP as key
  const authLimiter = rateLimit({
    windowMs: 60_000,
    max: 5,
    message: { success: false, message: "Trop de tentatives — réessayez dans 1 minute" },
    skip: (req) => req.path === "/api/health",
    keyGenerator: (req) => {
      return (
        (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
        req.ip ??
        "unknown"
      );
    },
  });
  app.use("/api/auth/login", authLimiter);

  // 4. Health check endpoint
  app.get("/api/health", async (_req, res) => {
    const health = await database.dualStore.healthCheck();
    res.json({ success: true, data: health });
  });

  // 5. Auth middleware — only for /api routes, excluding public auth endpoints
  // Note: When using app.use("/api"), Express strips the "/api" prefix from req.path
  app.use("/api", (req, res, next) => {
    if (
      req.method === "POST" &&
      (req.path === "/auth/login" ||
        req.path === "/auth/forgot-password" ||
        req.path === "/auth/reset-password")
    ) {
      return next();
    }
    return requireAuth(database)(req, res, next);
  });

  // 6. API routes
  registerAllRoutes(app, database);

  // 7. Development: Vite middleware (non-API requests only)
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use((req, res, next) => {
        if (req.path.startsWith("/api")) return next();
        vite.middlewares(req, res, next);
      });
    } catch {
      // Ignore - Vite not available
    }
  }

  // 8. Production: static file serving + SPA catch-all (AFTER API routes)
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      return res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // 9. Error handler
  app.use(errorHandler);

  return { app, db: database };
}