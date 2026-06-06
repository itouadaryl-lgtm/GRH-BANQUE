import type { Express } from "express";
import type { Database } from "../store/database.js";
import { registerSwaggerRoutes } from "./swagger.routes.js";
import { registerAuthRoutes } from "./auth.routes.js";
import { registerAdminRoutes } from "./admin.routes.js";
import { registerDocumentsRoutes } from "./documents.routes.js";
import { registerEmployeesRoutes } from "./employees.routes.js";
import { registerAgenciesRoutes } from "./agencies.routes.js";
import { registerFoldersRoutes } from "./folders.routes.js";
import { registerRolesRoutes } from "./roles.routes.js";
import { registerAccessRoutes } from "./access.routes.js";
import { registerCardsRoutes } from "./cards.routes.js";
import { registerParametersRoutes } from "./parameters.routes.js";
import { registerChatRoutes } from "./chat.routes.js";
import { registerWorkflowRoutes } from "./workflow.routes.js";
import { registerFinanceRoutes } from "./finance.routes.js";
import { registerNotificationsRoutes } from "./notifications.routes.js";
import { registerExportRoutes } from "./export.routes.js";
import { registerImportRoutes } from "./import.routes.js";
import type { Request, Response } from "express";

function serializeRoute(layer: any): any {
  if (!layer || typeof layer !== "object") return null;
  if (layer.route) {
    const methods: Record<string, boolean> = {};
    for (const m of Object.keys(layer.route.methods)) {
      methods[m] = true;
    }
    return {
      method: Object.keys(methods),
      path: layer.route.path,
      stackDepth: layer.stack ? layer.stack.length : 0,
    };
  }
  if (layer.name === "router" && layer.handle) {
    const children: any[] = [];
    for (const child of layer.handle.stack) {
      const childLayer = child.layer || child;
      const serialized = serializeRoute(childLayer);
      if (serialized) children.push(serialized);
    }
    return {
      router: true,
      path: layer.regexp?.toString() || "",
      prefix: layer.mountpath || "",
      routes: children,
    };
  }
  return null;
}

export function listRoutes(app: Express): any[] {
  const routes: any[] = [];
  for (const layer of (app as any)._router.stack) {
    const serialized = serializeRoute(layer);
    if (serialized) routes.push(serialized);
  }
  return routes;
}

export function registerAllRoutes(app: Express, db: Database): void {
  registerSwaggerRoutes(app);
  registerAuthRoutes(app, db);
  registerAdminRoutes(app, db);
  registerDocumentsRoutes(app, db);
  registerEmployeesRoutes(app, db);
  registerAgenciesRoutes(app, db);
  registerFoldersRoutes(app, db);
  registerRolesRoutes(app, db);
  registerAccessRoutes(app, db);
  registerCardsRoutes(app, db);
  registerParametersRoutes(app, db);
  registerChatRoutes(app, db);
  registerWorkflowRoutes(app, db);
  registerFinanceRoutes(app, db);
  registerNotificationsRoutes(app, db);
  registerExportRoutes(app, db);
  registerImportRoutes(app, db);

  app.get("/api/debug/routes", (_req: Request, res: Response) => {
    const routes = listRoutes(app);
    res.json({ success: true, data: routes });
  });
}

