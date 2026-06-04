/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createApp } from "./server/app.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

export async function startServer() {
  const { app } = await createApp();

  // In production, serve static files for SPA
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
    console.log("Production state: serving compiled files from /dist.");
  } else {
    console.log("Vite Development Server is hot-mounted via Express (middleware injected in createApp).");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AFG BANK ARCHIVES BACKEND] listening on http://0.0.0.0:${PORT}`);
    console.log("Port is hardcoded by infrastructure to 3000.");
  });
}

startServer();
