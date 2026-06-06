/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dotenv from "dotenv";
import { createApp } from "./server/app.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

export async function startServer() {
  const { app } = await createApp();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AFG BANK ARCHIVES BACKEND] listening on http://0.0.0.0:${PORT}`);
    console.log("Production: PORT injected by Railway infrastructure.");
  });
}

startServer();