import type { Express } from "express";
import type { Database } from "../store/database.js";
import { addAuditLog } from "../services/audit.service.js";
import { checkIsVoirTout, getReqUser } from "../middleware/auth.js";

export function registerDocumentsRoutes(app: Express, db: Database): void {
  app.get("/api/documents", (req, res) => {
    const currentUser = getReqUser(req);
    const isVoirTout = checkIsVoirTout(req, currentUser, db);
    const { search, category, type, employee, isDeleted } = req.query;
    let list = db.documents;

    if (isDeleted === "true") {
      list = db.documents.filter((d) => d.isDeleted);
    } else {
      list = db.documents.filter((d) => !d.isDeleted);
    }

    if (!isVoirTout) {
      list = list.filter((d) => d.agencyId === currentUser.agencyId);
    }

    if (search) {
      const s = String(search).toLowerCase();
      list = list.filter(
        (d) =>
          String(d.originalFileName).toLowerCase().includes(s) ||
          String(d.description || "").toLowerCase().includes(s)
      );
    }

    if (category) {
      const validTypes = db.documentTypes
        .filter((dt) => dt.categoryId === category)
        .map((dt) => dt.id);
      list = list.filter((d) => validTypes.includes(d.documentTypeId as string));
    }

    if (type) {
      list = list.filter((d) => d.documentTypeId === type);
    }

    if (employee) {
      list = list.filter((d) => d.employeeId === employee);
    }

    res.json({ success: true, data: list });
  });

  app.post("/api/documents", (req, res) => {
    const currentUser = getReqUser(req);
    const { originalFileName, documentTypeId, employeeId, description, fileSize, mimeType } = req.body;

    const newDoc = {
      id: `doc-${Date.now()}`,
      fileName: originalFileName,
      originalFileName,
      filePath: `/${currentUser.agencyId}/2026/05/${Date.now()}.bin`,
      fileSize: fileSize || 532000,
      mimeType: mimeType || "application/pdf",
      checksum: `sha-${Math.random().toString(36).substr(2, 9)}`,
      documentTypeId,
      employeeId: employeeId || currentUser.id,
      agencyId: currentUser.agencyId,
      uploadedById: currentUser.id,
      version: 1,
      description: description || "Téléversé manuellement",
      isDeleted: false,
      uploadDate: new Date().toISOString(),
    };

    db.documents.unshift(newDoc);
    addAuditLog(db, currentUser.id, "UPLOAD", "Document", originalFileName);

    const folderExists = db.folders.find((f) => f.ownerId === employeeId);
    if (!folderExists && employeeId) {
      const empUser = db.users.find((u) => u.id === employeeId);
      db.folders.push({
        id: `f-${Date.now()}`,
        name: `Dossier Employé - ${empUser?.fullName || "Collaborateur"}`,
        type: "EMPLOYEE",
        ownerId: employeeId,
        agencyId: currentUser.agencyId,
        description: `Dossier auto-créé lors de l'upload`,
        isDeleted: false,
        createdAt: new Date().toISOString(),
      });
    }

    db.scheduleSave();
    res.json({ success: true, message: "Document téléversé et indexé avec succès !", data: newDoc });
  });

  app.delete("/api/documents/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const doc = db.documents.find((d) => d.id === req.params.id);

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document non trouvé" });
    }

    doc.isDeleted = true;
    doc.deletedAt = new Date().toISOString();
    doc.deletedByUserId = currentUser.id;
    doc.retentionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    addAuditLog(db, currentUser.id, "DELETE", "Document", doc.originalFileName as string);
    db.scheduleSave();
    res.json({ success: true, message: "Document déplacé vers la Corbeille." });
  });

  app.post("/api/documents/:id/restore", (req, res) => {
    const currentUser = getReqUser(req);
    const doc = db.documents.find((d) => d.id === req.params.id);

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document non trouvé" });
    }

    doc.isDeleted = false;
    doc.deletedAt = undefined;
    doc.deletedByUserId = undefined;
    doc.retentionDate = undefined;

    addAuditLog(db, currentUser.id, "RESTORE", "Document", doc.originalFileName as string);
    db.scheduleSave();
    res.json({ success: true, message: "Document restauré avec succès !" });
  });

  app.delete("/api/documents/:id/permanent", (req, res) => {
    const currentUser = getReqUser(req);
    const docIndex = db.documents.findIndex((d) => d.id === req.params.id);

    if (docIndex === -1) {
      return res.status(404).json({ success: false, message: "Document non trouvé" });
    }

    const doc = db.documents[docIndex];
    db.documents.splice(docIndex, 1);

    addAuditLog(db, currentUser.id, "PERM_DELETE", "Document", doc.originalFileName as string);
    db.scheduleSave();
    res.json({ success: true, message: "Document définitivement purgé du disque." });
  });

  app.delete("/api/trash/empty", (req, res) => {
    const currentUser = getReqUser(req);
    const deletedCount = db.documents.filter((d) => d.isDeleted).length;
    db.documents = db.documents.filter((d) => !d.isDeleted);

    addAuditLog(db, currentUser.id, "PERM_DELETE", "Corbeille", `${deletedCount} documents purgés`);
    db.scheduleSave();
    res.json({ success: true, message: "La corbeille a été vidée." });
  });

  app.put("/api/documents/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const { id } = req.params;
    const { originalFileName, documentTypeId, employeeId, description, fileSize, mimeType, version } =
      req.body;
    const docIdx = db.documents.findIndex((d) => d.id === id);
    if (docIdx !== -1) {
      db.documents[docIdx] = {
        ...db.documents[docIdx],
        originalFileName:
          originalFileName !== undefined ? originalFileName : db.documents[docIdx].originalFileName,
        documentTypeId:
          documentTypeId !== undefined ? documentTypeId : db.documents[docIdx].documentTypeId,
        employeeId: employeeId !== undefined ? employeeId : db.documents[docIdx].employeeId,
        description: description !== undefined ? description : db.documents[docIdx].description,
        fileSize: fileSize !== undefined ? fileSize : db.documents[docIdx].fileSize,
        mimeType: mimeType !== undefined ? mimeType : db.documents[docIdx].mimeType,
        version: version !== undefined ? version : db.documents[docIdx].version || 1,
      };
      addAuditLog(
        db,
        currentUser.id,
        "UPDATE",
        "Document",
        db.documents[docIdx].originalFileName as string
      );
      db.scheduleSave();
      return res.json({
        success: true,
        message: "Informations d'archivage mises à jour avec succès !",
        data: db.documents[docIdx],
      });
    }
    res.status(404).json({ success: false, message: "Document introuvable" });
  });

  app.get("/api/categories", (_req, res) => {
    res.json({ success: true, data: db.categories });
  });

  app.get("/api/document-types", (_req, res) => {
    res.json({ success: true, data: db.documentTypes });
  });

  app.post("/api/document-types", (req, res) => {
    const currentUser = getReqUser(req);
    const { name, categoryId, description } = req.body;

    const newType = {
      id: `dt-${Date.now()}`,
      name,
      categoryId,
      description,
      isActive: true,
      iconColor: "indigo-500",
      iconType: "FileText",
    };

    db.documentTypes.push(newType);
    addAuditLog(db, currentUser.id, "UPDATE", "DocumentType", name);
    db.scheduleSave();
    res.json({ success: true, message: "Type de document ajouté avec succès !", data: newType });
  });

  app.put("/api/document-types/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const { id } = req.params;
    const { name, categoryId, description, isActive } = req.body;
    const dtIndex = db.documentTypes.findIndex((t) => t.id === id);
    if (dtIndex !== -1) {
      db.documentTypes[dtIndex] = {
        ...db.documentTypes[dtIndex],
        name: name !== undefined ? name : db.documentTypes[dtIndex].name,
        categoryId:
          categoryId !== undefined ? categoryId : db.documentTypes[dtIndex].categoryId,
        description:
          description !== undefined ? description : db.documentTypes[dtIndex].description,
        isActive: isActive !== undefined ? isActive : db.documentTypes[dtIndex].isActive,
      };
      addAuditLog(db, currentUser.id, "UPDATE", "DocumentType", db.documentTypes[dtIndex].name);
      db.scheduleSave();
      return res.json({
        success: true,
        message: "Type de document mis à jour avec succès !",
        data: db.documentTypes[dtIndex],
      });
    }
    res.status(404).json({ success: false, message: "Type de document non trouvé" });
  });

  app.delete("/api/document-types/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const { id } = req.params;
    const dtIndex = db.documentTypes.findIndex((t) => t.id === id);
    if (dtIndex !== -1) {
      const deleted = db.documentTypes[dtIndex];
      db.documentTypes.splice(dtIndex, 1);
      addAuditLog(db, currentUser.id, "DELETE", "DocumentType", deleted.name);
      db.scheduleSave();
      return res.json({ success: true, message: "Type de document supprimé avec succès !" });
    }
    res.status(404).json({ success: false, message: "Type de document non trouvé" });
  });

  app.delete("/api/activity-logs/:id", (req, res) => {
    const { id } = req.params;
    const idx = db.activityLogs.findIndex((l) => l.id === id);
    if (idx !== -1) {
      db.activityLogs.splice(idx, 1);
      db.scheduleSave();
      return res.json({ success: true, message: "Entrée de log d'audit supprimée !" });
    }
    res.status(404).json({ success: false, message: "Log introuvable" });
  });

  app.get("/api/activity-logs", (req, res) => {
    const currentUser = getReqUser(req);
    const isVoirTout = checkIsVoirTout(req, currentUser, db);
    let list = db.activityLogs;
    if (!isVoirTout) {
      list = db.activityLogs.filter((l) => l.agencyId === currentUser.agencyId);
    }
    res.json({ success: true, data: list });
  });
}
