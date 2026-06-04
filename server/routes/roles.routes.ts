import type { Express } from "express";
import type { Database } from "../store/database.js";
import { addAuditLog } from "../services/audit.service.js";
import { getReqUser } from "../middleware/auth.js";
import { apiCache, CACHE_KEYS } from "../services/cache.service.js";

export function registerRolesRoutes(app: Express, db: Database): void {
  app.post("/api/roles", (req, res) => {
    const currentUser = getReqUser(req);
    const { name, description, permissions } = req.body;
    const newRole = {
      id: `role-${Date.now()}`,
      name,
      description,
      permissions: permissions || [],
    };
    db.roles.push(newRole);
    apiCache.del(CACHE_KEYS.ROLES);
    addAuditLog(db, currentUser.id, "UPDATE", "Role", name);
    db.scheduleSave();
    res.json({ success: true, message: "Nouveau rôle d'accès configuré !", data: newRole });
  });

  app.delete("/api/roles/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const { id } = req.params;
    if (id === "role-super-admin" || id === "role-drh") {
      return res.status(400).json({
        success: false,
        message: "Interdiction de détruire un rôle système fondamental !",
      });
    }
    const rIdx = db.roles.findIndex((r) => r.id === id);
    if (rIdx !== -1) {
      const deleted = db.roles[rIdx];
      db.roles.splice(rIdx, 1);
      apiCache.del(CACHE_KEYS.ROLES);
      addAuditLog(db, currentUser.id, "DELETE", "Role", deleted.name);
      db.scheduleSave();
      return res.json({ success: true, message: "Rôle d'accès supprimé avec succès !" });
    }
    res.status(404).json({ success: false, message: "Rôle introuvable" });
  });

  app.get("/api/permissions", (_req, res) => {
    const cachedPerms = apiCache.get(CACHE_KEYS.PERMISSIONS);
    if (cachedPerms) {
      return res.json({ success: true, data: cachedPerms });
    }

    const permissionList = [
      { id: "1", code: "USER_READ", description: "Consulter la liste des administrateurs et auditeurs", module: "Utilisateurs" },
      { id: "2", code: "USER_CREATE", description: "Ajouter de nouveaux profils d'administration", module: "Utilisateurs" },
      { id: "3", code: "USER_UPDATE", description: "Modifier les profils privilèges d'administration", module: "Utilisateurs" },
      { id: "4", code: "EMPLOYEE_READ", description: "Consulter le registre national des collaborateurs", module: "Salariés" },
      { id: "5", code: "EMPLOYEE_CREATE", description: "Enregistrer et recruter de nouveaux employés", module: "Salariés" },
      { id: "6", code: "EMPLOYEE_UPDATE", description: "Mettre à jour les données signalétiques des employés", module: "Salariés" },
      { id: "7", code: "DOCUMENT_READ", description: "Lire et visualiser les archives de la GED", module: "GED" },
      { id: "8", code: "DOCUMENT_CREATE", description: "Indexer et téléverser des documents", module: "GED" },
      { id: "9", code: "DOCUMENT_UPDATE", description: "Modifier le type ou la description des documents", module: "GED" },
      { id: "10", code: "DOCUMENT_DELETE", description: "Déplacer des fiches vers la corbeille", module: "GED" },
      { id: "11", code: "DOCUMENT_RESTORE", description: "Restaurer un document archivé", module: "GED" },
      { id: "12", code: "CARD_GENERATE", description: "Créer des badges professionnels cryptés", module: "Salariés" },
      { id: "13", code: "ACCESS_REQUEST_APPROVE", description: "Approuver des requêtes d'accès inter-agences", module: "Workflows" },
      { id: "14", code: "AUDIT_LOG_READ", description: "Parcourir le grand livre des journaux cryptés d'audit", module: "Sécurité" },
      { id: "15", code: "AGENCY_VIEW", description: "Consulter les informations d'une agence locale", module: "Agences" },
      { id: "16", code: "AGENCY_VIEW_ALL", description: "Consulter l'ensemble des agences du réseau national", module: "Agences" },
      { id: "17", code: "ROLE_ASSIGN", description: "Attribuer ou modifier les habilitations des collaborateurs", module: "Utilisateurs" },
      { id: "18", code: "CHATBOT_ACCESS", description: "Interroger l'assistant virtuel ARHI alimenté par l'IA", module: "Sécurité" },
    ];

    apiCache.set(CACHE_KEYS.PERMISSIONS, permissionList);
    res.json({ success: true, data: permissionList });
  });

  app.get("/api/roles", (_req, res) => {
    const cachedRoles = apiCache.get(CACHE_KEYS.ROLES);
    if (cachedRoles) {
      return res.json({ success: true, data: cachedRoles });
    }
    apiCache.set(CACHE_KEYS.ROLES, db.roles);
    res.json({ success: true, data: db.roles });
  });

  app.put("/api/roles/:id", (req, res) => {
    const currentUser = getReqUser(req);
    const { permissions } = req.body;
    const role = db.roles.find((r) => r.id === req.params.id);

    if (!role) {
      return res.status(404).json({ success: false, message: "Rôle introuvable" });
    }

    role.permissions = permissions;
    apiCache.del(CACHE_KEYS.ROLES);
    addAuditLog(db, currentUser.id, "UPDATE", "Role", `Permissions de ${role.name}`);
    db.scheduleSave();
    res.json({ success: true, message: "Permissions du rôle mises à jour avec succès !", data: role });
  });
}
