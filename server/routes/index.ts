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
}

