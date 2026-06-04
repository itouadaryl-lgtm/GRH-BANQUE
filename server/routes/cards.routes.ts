import type { Express } from "express";
import type { Database } from "../store/database.js";
import { addAuditLog } from "../services/audit.service.js";
import { checkIsVoirTout, getReqUser } from "../middleware/auth.js";

export function registerCardsRoutes(app: Express, db: Database): void {
  app.delete("/api/professional-cards/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const { id } = req.params;
    const idx = db.professionalCards.findIndex((c) => c.id === id);
    if (idx !== -1) {
      const deleted = db.professionalCards[idx];
      db.professionalCards.splice(idx, 1);
      addAuditLog(db, currentUser.id, "DELETE", "ProfessionalCard", deleted.cardNumber as string);
      db.scheduleSave();
      return res.json({ success: true, message: "Carte professionnelle numérique révoquée !" });
    }
    res.status(404).json({ success: false, message: "Carte professionnelle introuvable" });
  });

  app.get("/api/professional-cards", (req, res) => {
    const currentUser = getReqUser(req);
    const isVoirTout = checkIsVoirTout(req, currentUser, db);
    let list = db.professionalCards;
    if (!isVoirTout) {
      list = db.professionalCards.filter((c) => {
        const emp = db.users.find((u) => u.id === c.employeeId);
        return emp?.agencyId === currentUser.agencyId;
      });
    }
    const cardsWithDetails = list.map((c) => {
      const emp = db.users.find((u) => u.id === c.employeeId);
      return {
        ...c,
        employeeName: emp?.fullName,
        employeeMatricule: emp?.matricule,
        employeePosition: emp?.position,
        employeePhotoUrl: emp?.photoUrl,
      };
    });
    res.json({ success: true, data: cardsWithDetails });
  });

  app.post("/api/professional-cards/generate/:employeeId", (req, res) => {
    const currentUser = getReqUser(req);
    const empId = req.params.employeeId;
    const employeeObj = db.users.find((u) => u.id === empId);

    if (!employeeObj) {
      return res.status(404).json({ success: false, message: "Collaborateur non trouvé" });
    }

    const existingCardIndex = db.professionalCards.findIndex((c) => c.employeeId === empId);
    const cardId = `card-${Date.now()}`;
    const cardNumber = `AFGBANK-2024-${employeeObj.matricule}`;

    const newCard = {
      id: cardId,
      employeeId: empId,
      cardNumber,
      issueDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      qrCodeUrl: `https://archives-rh.afgbank.ga/verify/card/${cardNumber}`,
      status: "ACTIVE",
      generatedAt: new Date().toISOString(),
      generatedById: currentUser.id,
    };

    if (existingCardIndex !== -1) {
      db.professionalCards[existingCardIndex] = newCard;
    } else {
      db.professionalCards.unshift(newCard);
    }

    addAuditLog(db, currentUser.id, "CARD_GENERATE", "ProfessionalCard", cardNumber);
    db.scheduleSave();
    res.json({ success: true, message: "Carte Professionnelle numérique générée avec succès !", data: newCard });
  });
}
