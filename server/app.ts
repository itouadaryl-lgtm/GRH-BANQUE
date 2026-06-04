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

  app.use(express.json({ limit: "60mb" }));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  // Vite middleware AFTER JSON parser but use conditional route handling
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      // Vite handles all non-API routes for SPA
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

  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get("/api/health", async (_req, res) => {
    const health = await database.dualStore.healthCheck();
    res.json({ success: true, data: health });
  });

  app.use((req, res, next) => {
    if (
      req.method === "POST" &&
      (req.path === "/api/auth/login" ||
        req.path === "/api/auth/forgot-password" ||
        req.path === "/api/auth/reset-password")
    ) {
      return next();
    }
    return requireAuth(database)(req, res, next);
  });

  registerAllRoutes(app, database);

  app.use(errorHandler);

  return { app, db: database };
}
