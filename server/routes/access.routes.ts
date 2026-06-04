import type { Express } from "express";
import type { Database } from "../store/database.js";
import { addAuditLog } from "../services/audit.service.js";
import { checkIsVoirTout, getReqUser } from "../middleware/auth.js";

export function registerAccessRoutes(app: Express, db: Database): void {
  app.get("/api/access-requests", (req, res) => {
    const currentUser = getReqUser(req);
    const isVoirTout = checkIsVoirTout(req, currentUser, db);
    let list = db.accessRequests;
    if (!isVoirTout) {
      list = db.accessRequests.filter((r) => {
        const rq = db.users.find((u) => u.id === r.requesterId);
        return rq?.agencyId === currentUser.agencyId;
      });
    }
    const data = list.map((reqObj) => {
      const document = db.documents.find((d) => d.id === reqObj.documentId);
      const requester = db.users.find((u) => u.id === reqObj.requesterId);
      return {
        ...reqObj,
        documentName: document?.originalFileName || "Fichier supprimé",
        requesterName: requester?.fullName || "Employé",
        requesterPosition: requester?.position || "Poste",
        requesterPhotoUrl: requester?.photoUrl,
      };
    });
    res.json({ success: true, data });
  });

  app.post("/api/access-requests", (req, res) => {
    const currentUser = getReqUser(req);
    const { documentId, reason } = req.body;

    const newReq = {
      id: `req-${Date.now()}`,
      documentId,
      requesterId: currentUser.id,
      status: "PENDING",
      reason,
      requestedAt: new Date().toISOString(),
    };

    db.accessRequests.unshift(newReq);
    addAuditLog(db, currentUser.id, "UPDATE", "AccessRequest", `ID Doc: ${documentId}`);
    db.scheduleSave();
    res.json({ success: true, message: "Votre demande d'accès a été soumise au DRH !" });
  });

  app.put("/api/access-requests/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const { status, approverComment } = req.body;
    const reqObj = db.accessRequests.find((r) => r.id === req.params.id);

    if (!reqObj) {
      return res.status(404).json({ success: false, message: "Demande introuvable" });
    }

    reqObj.status = status;
    reqObj.approvedById = currentUser.id;
    reqObj.approvedAt = new Date().toISOString();
    reqObj.approverComment = approverComment;

    addAuditLog(db, currentUser.id, "UPDATE", "AccessRequestStatus", `Statut: ${status}`);
    db.scheduleSave();
    res.json({
      success: true,
      message: `La demande a été ${status === "APPROVED" ? "approuvée" : "rejetée"} avec succès !`,
    });
  });
}
