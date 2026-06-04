import type { Express } from "express";
import type { Database } from "../store/database.js";
import { getReqUser } from "../middleware/auth.js";

export function registerNotificationsRoutes(app: Express, db: Database): void {
  app.get("/api/notifications", (req, res) => {
    const currentUser = getReqUser(req);
    const userNotifs = db.userNotifications.filter((n) => n.userId === currentUser.id);
    res.json({ success: true, data: userNotifs });
  });

  app.put("/api/notifications/:id/read", (req, res) => {
    const currentUser = getReqUser(req);
    const { id } = req.params;
    const idx = db.userNotifications.findIndex(
      (n) => n.id === id && n.userId === currentUser.id
    );
    if (idx !== -1) {
      db.userNotifications[idx].status = "READ";
      db.scheduleSave();
      return res.json({ success: true, message: "Notification lue." });
    }
    res.status(404).json({ success: false, message: "Notification introuvable." });
  });

  app.delete("/api/notifications/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const { id } = req.params;
    const idx = db.userNotifications.findIndex(
      (n) => n.id === id && n.userId === currentUser.id
    );
    if (idx !== -1) {
      db.userNotifications.splice(idx, 1);
      db.scheduleSave();
      return res.json({ success: true, message: "Notification effacée." });
    }
    res.status(404).json({ success: false, message: "Notification introuvable." });
  });
}
