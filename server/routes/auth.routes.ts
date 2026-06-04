// server/routes/auth.routes.ts

import type { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { Database } from "../store/database.js";
import { addAuditLog } from "../services/audit.service.js";
import { signToken, refreshToken, blacklistToken } from "../services/jwt.service.js";
import { getReqUser } from "../middleware/auth.js";

const resetTokens = new Map<string, { email: string; exp: number }>();

export function registerAuthRoutes(app: Express, db: Database): void {
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, matricule, password } = req.body;
    const loginId = (email || matricule || "").trim().toLowerCase();

    const user = db.users.find(
      (u) =>
        (u.email.toLowerCase() === loginId || u.matricule.toLowerCase() === loginId) &&
        !u.failedLoginAttempts
    );

    if (!user?.passwordHash || !(await bcrypt.compare(password ?? "", user.passwordHash))) {
      return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect" });
    }

    const role = db.roles.find((r) => r.id === user.roleId);
    addAuditLog(db, user.id, "LOGIN", "User", user.fullName);

    const { token, expiresAt } = signToken(user.id);
    res.json({
      success: true,
      data: {
        token,
        expiresAt,
        accessToken: token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: role?.name,
          roleName: role?.name,
          permissions: role?.permissions,
          agencyId: user.agencyId,
          matricule: user.matricule,
          photoUrl: user.photoUrl,
          position: user.position,
          department: user.department,
        },
      },
    });
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      blacklistToken(authHeader.substring(7));
    }
    res.json({ success: true, message: "Déconnexion réussie" });
  });

  app.post("/api/auth/refresh", (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token requis" });
    }
    const refreshed = refreshToken(authHeader.substring(7));
    if (!refreshed) {
      return res.status(401).json({ success: false, message: "Refresh impossible" });
    }
    res.json({ success: true, data: refreshed });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    const user = getReqUser(req);
    const role = db.roles.find((r) => r.id === user.roleId);
    res.json({
      success: true,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: role?.name,
        roleName: role?.name,
        permissions: role?.permissions,
        agencyId: user.agencyId,
        matricule: user.matricule,
        photoUrl: user.photoUrl,
        position: user.position,
        department: user.department,
      },
    });
  });

  app.post("/api/auth/forgot-password", (req: Request, res: Response) => {
    const { email } = req.body;
    const user = db.users.find((u) => u.email.toLowerCase() === String(email || "").toLowerCase());
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      resetTokens.set(token, { email: user.email, exp: Date.now() + 3600_000 });
      if (process.env.NODE_ENV !== "production") {
        console.log(`[Auth] Reset password link (dev): token=${token} email=${user.email}`);
      }
    }
    res.json({
      success: true,
      message: "Si l'email existe, un lien de réinitialisation a été envoyé.",
    });
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    const entry = resetTokens.get(token);
    if (!entry || entry.exp < Date.now()) {
      return res.status(400).json({ success: false, message: "Token invalide ou expiré" });
    }
    const user = db.users.find((u) => u.email === entry.email);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    }
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);
    user.passwordHash = await bcrypt.hash(newPassword, rounds);
    resetTokens.delete(token);
    db.scheduleSave();
    res.json({ success: true, message: "Mot de passe réinitialisé" });
  });
}
