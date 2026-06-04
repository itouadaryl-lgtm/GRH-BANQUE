import type { Express } from "express";
import type { Database } from "../store/database.js";
import { addAuditLog } from "../services/audit.service.js";
import { checkIsVoirTout, getReqUser } from "../middleware/auth.js";

export function registerFoldersRoutes(app: Express, db: Database): void {
  app.get("/api/folders", (req, res) => {
    const currentUser = getReqUser(req);
    const isVoirTout = checkIsVoirTout(req, currentUser, db);
    let list = db.folders;
    if (!isVoirTout) {
      list = db.folders.filter((f) => f.agencyId === currentUser.agencyId);
    }
    res.json({ success: true, data: list });
  });

  app.post("/api/folders", (req, res) => {
    const currentUser = getReqUser(req);
    const { name, type, ownerId, agencyId, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Le nom du dossier est requis." });
    }
    const newFolder = {
      id: `f-${Date.now()}`,
      name,
      type: type || "GENERAL",
      ownerId: ownerId || undefined,
      agencyId: agencyId || currentUser.agencyId,
      description: description || "",
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };
    db.folders.push(newFolder);
    addAuditLog(db, currentUser.id, "UPDATE", "Folder", name);
    db.scheduleSave();
    res.json({ success: true, message: "Dossier créé avec succès !", data: newFolder });
  });

  app.put("/api/folders/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const { id } = req.params;
    const { name, type, ownerId, agencyId, description, isDeleted } = req.body;
    const folderIdx = db.folders.findIndex((f) => f.id === id);
    if (folderIdx !== -1) {
      db.folders[folderIdx] = {
        ...db.folders[folderIdx],
        name: name !== undefined ? name : db.folders[folderIdx].name,
        type: type !== undefined ? type : db.folders[folderIdx].type,
        ownerId: ownerId !== undefined ? ownerId : db.folders[folderIdx].ownerId,
        agencyId: agencyId !== undefined ? agencyId : db.folders[folderIdx].agencyId,
        description: description !== undefined ? description : db.folders[folderIdx].description,
        isDeleted: isDeleted !== undefined ? !!isDeleted : db.folders[folderIdx].isDeleted,
      };
      addAuditLog(db, currentUser.id, "UPDATE", "Folder", db.folders[folderIdx].name as string);
      db.scheduleSave();
      return res.json({
        success: true,
        message: "Dossier mis à jour avec succès !",
        data: db.folders[folderIdx],
      });
    }
    res.status(404).json({ success: false, message: "Dossier introuvable" });
  });

  app.delete("/api/folders/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const { id } = req.params;
    const folderIdx = db.folders.findIndex((f) => f.id === id);
    if (folderIdx !== -1) {
      const deleted = db.folders[folderIdx];
      db.folders.splice(folderIdx, 1);
      addAuditLog(db, currentUser.id, "DELETE", "Folder", deleted.name as string);
      db.scheduleSave();
      return res.json({ success: true, message: "Dossier supprimé définitivement !" });
    }
    res.status(404).json({ success: false, message: "Dossier introuvable" });
  });
}
