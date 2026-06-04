import type { Database } from "../store/database.js";

export function addAuditLog(
  db: Database,
  userId: string,
  action: string,
  entityType: string,
  entityLabel: string | unknown,
  ip: string = "127.0.0.1"
) {
  const userObj = db.users.find((u) => u.id === userId);
  const agency = db.agencies.find((a) => a.id === userObj?.agencyId);
  const roleObj = db.roles.find((r) => r.id === userObj?.roleId);

  const logEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    userId,
    userFullName: userObj ? `${userObj.firstName} ${userObj.lastName}` : "Utilisateur Inconnu",
    userPhotoUrl: userObj?.photoUrl,
    userRoleName: (roleObj?.name || "EMPLOYEE") as string,
    action,
    entityType,
    entityLabel: String(entityLabel ?? ""),
    ipAddress: ip,
    userAgent: "Google Workspace Native Browser",
    timestamp: new Date().toISOString(),
    agencyCode: agency?.code || "CLIENT",
    agencyId: agency?.id || "unknown",
  };

  db.activityLogs.unshift(logEntry);
  db.scheduleSave();
}
