import type { Request, Response, NextFunction } from "express";
import type { Database, StoreUser } from "../store/database.js";
import { verifyToken } from "../services/jwt.service.js";

export function checkIsVoirTout(req: Request, currentUser: StoreUser, db: Database): boolean {
  const roleObj = db.roles.find((r) => r.id === currentUser.roleId);
  const isSuperOrDrh =
    currentUser.agencyId === "ag-siege" &&
    (roleObj?.name === "SUPER_ADMIN" || roleObj?.name === "DRH");
  const headerActive = req.headers["x-voir-tout"] === "true";
  return isSuperOrDrh && headerActive;
}

export function getAuthenticatedUser(req: Request, db: Database): StoreUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload?.userId) {
    return null;
  }
  const user = db.users.find((u) => u.id === payload.userId);
  return user ?? null;
}

export function requireAuth(db: Database) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === "POST" && req.path === "/api/auth/login") {
      return next();
    }
    const user = getAuthenticatedUser(req, db);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise. Jeton manquant ou invalide.",
      });
    }
    (req as Request & { user: StoreUser }).user = user;
    next();
  };
}

export function getReqUser(req: Request): StoreUser {
  return (req as Request & { user: StoreUser }).user;
}
