import type { Express } from "express";
import type { Database } from "../store/database.js";
import { addAuditLog } from "../services/audit.service.js";
import { checkIsVoirTout, getReqUser } from "../middleware/auth.js";

export function registerAdminRoutes(app: Express, db: Database): void {
  app.post("/api/audit-voir-tout", (req, res) => {
    const currentUser = getReqUser(req);
    const roleObj = db.roles.find((r) => r.id === currentUser.roleId);
    const isSuperOrDrh =
      currentUser.agencyId === "ag-siege" &&
      (roleObj?.name === "SUPER_ADMIN" || roleObj?.name === "DRH");
    const { active } = req.body;

    if (!isSuperOrDrh) {
      return res.status(403).json({
        success: false,
        message: "Action interdite : vous n'êtes pas Directeur ou Administrateur au Siège Social.",
      });
    }

    addAuditLog(
      db,
      currentUser.id,
      "CONSULT",
      "Supervision",
      active
        ? "Activation du mode de supervision globale VOIR TOUT (Réseau National)"
        : "Désactivation du mode VOIR TOUT",
      req.ip || "127.0.0.1"
    );

    res.json({ success: true, message: "Supervision journalisée dans le registre d'audit central." });
  });

  app.post("/api/admin/reset", (req, res) => {
    const currentUser = getReqUser(req);
    db.resetDynamicData(currentUser.id);

    addAuditLog(
      db,
      currentUser.id,
      "DELETE",
      "System",
      "Réinitialisation globale de l'application à zéro (0000)",
      req.ip || "127.0.0.1"
    );

    res.json({
      success: true,
      message:
        "L'application a été entièrement réinitialisée à zéro (0000) et toutes les archives dynamic ont été purgées de la GED.",
    });
  });

  app.get("/api/dashboard/stats", (req, res) => {
    const currentUser = getReqUser(req);
    const isVoirTout = checkIsVoirTout(req, currentUser, db);

    let filteredDocs = db.documents.filter((d) => !d.isDeleted);
    let filteredUsers = db.users.filter((u) => u.status === "ACTIVE");
    let filteredFolders = db.folders.filter((f) => !f.isDeleted);
    let filteredRequests = db.accessRequests.filter((r) => r.status === "PENDING");

    if (!isVoirTout) {
      filteredDocs = filteredDocs.filter((d) => d.agencyId === currentUser.agencyId);
      filteredUsers = filteredUsers.filter((u) => u.agencyId === currentUser.agencyId);
      filteredFolders = filteredFolders.filter((f) => f.agencyId === currentUser.agencyId);
      filteredRequests = filteredRequests.filter((r) => {
        const rq = db.users.find((u) => u.id === r.requesterId);
        return rq?.agencyId === currentUser.agencyId;
      });
    }

    const countFactor = isVoirTout ? 1.0 : currentUser.agencyId === "ag-siege" ? 0.65 : 0.15;
    const totalDocs = Math.round(filteredDocs.length + 1240 * countFactor);
    const activeEmployees = Math.round(filteredUsers.length + 312 * countFactor);
    const totalAgencies = isVoirTout ? db.agencies.length : 1;
    const totalFoldersVal = Math.round(filteredFolders.length + 400 * countFactor);
    const pendingRequests = Math.round(filteredRequests.length + 20 * countFactor);

    const distribution = [
      { name: "Contrats de travail", count: Math.round(totalDocs * 0.35), percent: 35 },
      { name: "Fiches de paie", count: Math.round(totalDocs * 0.25), percent: 25 },
      { name: "Attestations", count: Math.round(totalDocs * 0.15), percent: 15 },
      { name: "Documents CNSS", count: Math.round(totalDocs * 0.15), percent: 15 },
      { name: "Autres", count: Math.round(totalDocs * 0.1), percent: 10 },
    ];

    res.json({
      success: true,
      data: {
        totalDocs,
        activeEmployees,
        totalAgencies,
        totalFolders: totalFoldersVal,
        pendingRequests,
        distribution,
      },
    });
  });
}
