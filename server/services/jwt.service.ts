// server/services/jwt.service.ts

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "afg-bank-dev-secret-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "12h";

export interface JwtPayload {
  userId: string;
  sub: string;
  exp?: number;
  iat?: number;
}

const tokenBlacklist = new Map<string, number>();

export function signToken(userId: string): { token: string; expiresAt: string } {
  const token = jwt.sign({ userId, sub: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
  const decoded = jwt.decode(token) as JwtPayload;
  const expiresAt = decoded?.exp
    ? new Date(decoded.exp * 1000).toISOString()
    : new Date(Date.now() + 12 * 3600_000).toISOString();
  return { token, expiresAt };
}

export function verifyToken(token: string): JwtPayload | null {
  if (tokenBlacklist.has(token)) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function blacklistToken(token: string): void {
  try {
    const decoded = jwt.decode(token) as JwtPayload | null;
    const exp = decoded?.exp ?? Math.floor(Date.now() / 1000) + 3600;
    tokenBlacklist.set(token, exp);
  } catch {
    tokenBlacklist.set(token, Math.floor(Date.now() / 1000) + 3600);
  }
}

export function purgeExpiredBlacklist(): void {
  const now = Math.floor(Date.now() / 1000);
  for (const [token, exp] of tokenBlacklist.entries()) {
    if (exp <= now) tokenBlacklist.delete(token);
  }
}

setInterval(purgeExpiredBlacklist, 60_000);

export function refreshToken(oldToken: string): { token: string; expiresAt: string } | null {
  const payload = verifyToken(oldToken);
  if (!payload?.userId) return null;
  const decoded = jwt.decode(oldToken) as JwtPayload | null;
  if (!decoded?.iat) return null;
  const ageMs = Date.now() - decoded.iat * 1000;
  if (ageMs > 24 * 3600_000) return null;
  blacklistToken(oldToken);
  return signToken(payload.userId);
}
