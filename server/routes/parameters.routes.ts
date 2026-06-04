import type { Express } from "express";
import type { Database } from "../store/database.js";
import { addAuditLog } from "../services/audit.service.js";
import { getReqUser } from "../middleware/auth.js";

export function registerParametersRoutes(app: Express, db: Database): void {
  app.post("/api/system-parameters", (req, res) => {
    const currentUser = getReqUser(req);
    const { paramKey, paramValue, description, paramType } = req.body;
    if (!paramKey) return res.status(400).json({ success: false, message: "Clé du paramètre obligatoire." });
    const newParam = {
      id: `p-${Date.now()}`,
      paramKey,
      paramValue: paramValue || "",
      description: description || "",
      paramType: paramType || "STRING",
      isEditable: true,
    };
    db.systemParameters.push(newParam);
    addAuditLog(db, currentUser.id, "UPDATE", "SystemParameter", paramKey);
    db.scheduleSave();
    res.json({ success: true, message: "Paramètre système créé !", data: newParam });
  });

  app.delete("/api/system-parameters/:paramKey", (req, res) => {
    const currentUser = getReqUser(req);
    const { paramKey } = req.params;
    const idx = db.systemParameters.findIndex((p) => p.paramKey === paramKey);
    if (idx !== -1) {
      db.systemParameters.splice(idx, 1);
      addAuditLog(db, currentUser.id, "DELETE", "SystemParameter", paramKey);
      db.scheduleSave();
      return res.json({ success: true, message: "Paramètre système supprimé !" });
    }
    res.status(404).json({ success: false, message: "Paramètre introuvable" });
  });

  app.put("/api/system-parameters/:paramKey", (req, res) => {
    const currentUser = getReqUser(req);
    const { paramValue } = req.body;
    const param = db.systemParameters.find((p) => p.paramKey === req.params.paramKey);

    if (!param) {
      return res.status(404).json({ success: false, message: "Paramètre non trouvé" });
    }

    param.paramValue = paramValue;
    addAuditLog(db, currentUser.id, "UPDATE", "SystemParameter", param.paramKey);
    db.scheduleSave();
    res.json({ success: true, message: "Paramètre système sauvegardé !", data: param });
  });

  app.get("/api/system-parameters", (_req, res) => {
    res.json({ success: true, data: db.systemParameters });
  });
}
