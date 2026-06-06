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

  // PRODUCTION: Serve static files FIRST (before auth middleware)
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
  }

  app.use(express.json({ limit: "60mb" }));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  // DEVELOPMENT: Vite middleware
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

  const authLimiter = rateLimit({
    windowMs: 60_000,
    max: 5,
    message: { success: false, message: "Trop de tentatives — réessayez dans 1 minute" },
  });
  app.use("/api/auth/login", authLimiter);

  app.get("/api/health", async (_req, res) => {
    const health = await database.dualStore.healthCheck();
    res.json({ success: true, data: health });
  });

  // AUTH: Only apply to /api routes, NOT to frontend routes
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

  registerAllRoutes(app, database);

  // Catch-all for SPA: only if no API route matched
  if (process.env.NODE_ENV === "production") {
    app.get("*", (req, res) => {
      return res.sendFile(path.join(path.join(process.cwd(), "dist"), "index.html"));
    });
  }

  app.use(errorHandler);

  return { app, db: database };
}