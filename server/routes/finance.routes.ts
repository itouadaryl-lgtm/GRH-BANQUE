import type { Express } from "express";
import type { Database } from "../store/database.js";
import { addAuditLog } from "../services/audit.service.js";
import { getReqUser } from "../middleware/auth.js";

export function registerFinanceRoutes(app: Express, db: Database): void {
  app.get("/api/finance/transactions", (req, res) => {
    const currentUser = getReqUser(req);
    const roleObj = db.roles.find((r) => r.id === currentUser.roleId);
    const isFinance =
      roleObj?.name === "COMPTABLE" || roleObj?.name === "SUPER_ADMIN" || roleObj?.name === "DRH";
    const isAgencyAdmin = roleObj?.name === "ADMIN";

    if (isFinance) {
      return res.json({ success: true, data: db.financeTransactions });
    }
    if (isAgencyAdmin) {
      const filtered = db.financeTransactions.filter(
        (tx) => tx.agencyId === currentUser.agencyId
      );
      return res.json({ success: true, data: filtered });
    }
    return res.status(403).json({
      success: false,
      message: "Accès financier restreint aux comptabilités de la banque.",
    });
  });

  app.post("/api/finance/transactions", (req, res) => {
    const currentUser = getReqUser(req);
    const { type, title, amount, department, reference, agencyId } = req.body;

    const roleObj = db.roles.find((r) => r.id === currentUser.roleId);
    const isComptable = roleObj?.name === "COMPTABLE" || roleObj?.name === "SUPER_ADMIN";
    if (!isComptable) {
      return res.status(403).json({
        success: false,
        message: "Habilitations de trésorerie non affectées à votre compte.",
      });
    }

    if (!type || !title || !amount) {
      return res.status(400).json({
        success: false,
        message: "Les variables type, titre et montant de la transaction doivent être définis.",
      });
    }

    const newTx = {
      id: `tx-${Date.now()}`,
      type,
      title,
      amount: Number(amount),
      date: new Date().toISOString().substring(0, 10),
      status: "COMPLETED",
      department: department || "Finance globale",
      reference: reference || `REF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      agencyId: agencyId || currentUser.agencyId,
    };

    db.financeTransactions.unshift(newTx);
    addAuditLog(
      db,
      currentUser.id,
      "UPDATE",
      "Transaction",
      `Paiement enregistré : ${title} (${amount} FCFA)`,
      req.ip
    );
    db.scheduleSave();

    res.json({
      success: true,
      message: "Transaction de crédit/débit comptabilisée avec succès !",
      data: newTx,
    });
  });

  app.put("/api/finance/transactions/:id/status", (req, res) => {
    const currentUser = getReqUser(req);
    const { id } = req.params;
    const { status } = req.body;

    const idx = db.financeTransactions.findIndex((t) => t.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "Fiche transaction introuvable." });
    }

    db.financeTransactions[idx].status = status;
    addAuditLog(
      db,
      currentUser.id,
      "UPDATE",
      "Transaction",
      `Modification de la transaction ${id} avec le statut ${status}`,
      req.ip
    );
    db.scheduleSave();
    res.json({ success: true, message: "Statut transaction ré-évalué.", data: db.financeTransactions[idx] });
  });

  app.delete("/api/finance/transactions/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const { id } = req.params;
    const idx = db.financeTransactions.findIndex((t) => t.id === id);
    if (idx !== -1) {
      db.financeTransactions.splice(idx, 1);
      addAuditLog(
        db,
        currentUser.id,
        "DELETE",
        "Transaction",
        `Annulation définitive de l'opération ${id}`,
        req.ip
      );
      db.scheduleSave();
      return res.json({ success: true, message: "Fiche d'écritures annulée définitivement" });
    }
    res.status(404).json({ success: false, message: "Transaction introuvable" });
  });
}
