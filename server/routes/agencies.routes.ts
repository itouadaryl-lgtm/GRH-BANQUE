import type { Express } from "express";
import type { Database } from "../store/database.js";
import { addAuditLog } from "../services/audit.service.js";
import { checkIsVoirTout, getReqUser } from "../middleware/auth.js";

export function registerAgenciesRoutes(app: Express, db: Database): void {
  app.get("/api/agencies", (req, res) => {
    const currentUser = getReqUser(req);
    const isVoirTout = checkIsVoirTout(req, currentUser, db);
    let list = db.agencies;
    if (!isVoirTout) {
      list = db.agencies.filter((a) => a.id === currentUser.agencyId);
    }
    res.json({ success: true, data: list });
  });

  app.post("/api/agencies", (req, res) => {
    const currentUser = getReqUser(req);
    const { code, name, address, city, phone, email, isHeadOffice, isActive } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: "Le code et le nom sont requis pour l'agence." });
    }
    const newAgency = {
      id: `ag-${Date.now()}`,
      code,
      name,
      address: address || "",
      city: city || "",
      phone: phone || "",
      email: email || "",
      isHeadOffice: !!isHeadOffice,
      isActive: isActive !== false,
    };
    db.agencies.push(newAgency);
    addAuditLog(db, currentUser.id, "IMPORT", "Agency", name);
    db.scheduleSave();
    res.json({ success: true, message: "Agence ajoutée avec succès !", data: newAgency });
  });

  app.put("/api/agencies/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const { id } = req.params;
    const { code, name, address, city, phone, email, isHeadOffice, isActive } = req.body;
    const agencyIdx = db.agencies.findIndex((a) => a.id === id);
    if (agencyIdx !== -1) {
      db.agencies[agencyIdx] = {
        ...db.agencies[agencyIdx],
        code: code !== undefined ? code : db.agencies[agencyIdx].code,
        name: name !== undefined ? name : db.agencies[agencyIdx].name,
        address: address !== undefined ? address : db.agencies[agencyIdx].address,
        city: city !== undefined ? city : db.agencies[agencyIdx].city,
        phone: phone !== undefined ? phone : db.agencies[agencyIdx].phone,
        email: email !== undefined ? email : db.agencies[agencyIdx].email,
        isHeadOffice:
          isHeadOffice !== undefined ? !!isHeadOffice : db.agencies[agencyIdx].isHeadOffice,
        isActive: isActive !== undefined ? !!isActive : db.agencies[agencyIdx].isActive,
      };
      addAuditLog(db, currentUser.id, "UPDATE", "Agency", db.agencies[agencyIdx].name);
      db.scheduleSave();
      return res.json({
        success: true,
        message: "Agence mise à jour avec succès !",
        data: db.agencies[agencyIdx],
      });
    }
    res.status(404).json({ success: false, message: "Agence introuvable" });
  });

  app.delete("/api/agencies/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const { id } = req.params;
    const agencyIdx = db.agencies.findIndex((a) => a.id === id);
    if (agencyIdx !== -1) {
      const deleted = db.agencies[agencyIdx];
      db.agencies.splice(agencyIdx, 1);
      addAuditLog(db, currentUser.id, "DELETE", "Agency", deleted.name);
      db.scheduleSave();
      return res.json({ success: true, message: "Agence supprimée avec succès !" });
    }
    res.status(404).json({ success: false, message: "Agence introuvable" });
  });
}
