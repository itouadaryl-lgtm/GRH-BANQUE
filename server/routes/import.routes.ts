// server/routes/import.routes.ts
// § Import en masse — Collaborateurs & Documents depuis JSON (parsing XLSX/CSV côté client)

import type { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import type { Database } from "../store/database.js";
import { getReqUser } from "../middleware/auth.js";
import { addAuditLog } from "../services/audit.service.js";

// ─── Mot de passe par défaut pour les comptes importés ─────────────────────
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync("123", 12);

// ─── Génération d'identifiant unique avec suffixe aléatoire ────────────────
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

// ─── Validation email (format basique RFC 5322 simplifié) ──────────────────
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// ─── Interface ligne employé reçue du frontend ────────────────────────────
interface EmployeeRow {
  matricule?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  agencyId?: string;
  hireDate?: string;
  birthDate?: string;
}

// ─── Interface ligne document reçue du frontend ───────────────────────────
interface DocumentRow {
  originalFileName?: string;
  documentTypeId?: string;
  description?: string;
  mimeType?: string;
  agencyId?: string;
}

export function registerImportRoutes(app: Express, db: Database): void {
  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/import/employees — Import en masse des collaborateurs
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/import/employees", (req: Request, res: Response) => {
    const currentUser = getReqUser(req);
    const body = req.body as { rows?: EmployeeRow[]; data?: EmployeeRow[] };
    const rows = body.rows || body.data;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Le champ « rows » ou « data » est requis et doit être un tableau non vide.",
      });
    }

    const errors: string[] = [];
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const lineLabel = `Ligne ${i + 1}`;

      // ── Validation des champs obligatoires ─────────────────────────────
      if (!row.matricule || typeof row.matricule !== "string" || !row.matricule.trim()) {
        errors.push(`${lineLabel} : matricule manquant ou invalide.`);
        skipped++;
        continue;
      }

      if (!row.firstName || typeof row.firstName !== "string" || !row.firstName.trim()) {
        errors.push(`${lineLabel} : prénom manquant ou invalide.`);
        skipped++;
        continue;
      }

      if (!row.lastName || typeof row.lastName !== "string" || !row.lastName.trim()) {
        errors.push(`${lineLabel} : nom de famille manquant ou invalide.`);
        skipped++;
        continue;
      }

      if (!row.email || typeof row.email !== "string" || !isValidEmail(row.email.trim())) {
        errors.push(`${lineLabel} : email manquant ou format invalide.`);
        skipped++;
        continue;
      }

      const matriculeTrimmed = row.matricule.trim();
      const emailTrimmed = row.email.trim().toLowerCase();

      // ── Vérification de doublons (matricule et email) ──────────────────
      if (db.users.some((u) => u.matricule === matriculeTrimmed)) {
        errors.push(`${lineLabel} : le matricule « ${matriculeTrimmed} » existe déjà.`);
        skipped++;
        continue;
      }

      if (db.users.some((u) => u.email.toLowerCase() === emailTrimmed)) {
        errors.push(`${lineLabel} : l'email « ${emailTrimmed} » est déjà utilisé.`);
        skipped++;
        continue;
      }

      // ── Création du collaborateur ──────────────────────────────────────
      const firstNameClean = row.firstName.trim();
      const lastNameClean = row.lastName.trim();

      const newUser = {
        id: generateId("u"),
        matricule: matriculeTrimmed,
        email: emailTrimmed,
        passwordHash: DEFAULT_PASSWORD_HASH,
        firstName: firstNameClean,
        lastName: lastNameClean,
        fullName: `${firstNameClean} ${lastNameClean}`,
        photoUrl:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        phone: row.phone?.trim() || undefined,
        birthDate: row.birthDate?.trim() || undefined,
        hireDate: row.hireDate?.trim() || undefined,
        department: row.department?.trim() || undefined,
        position: row.position?.trim() || undefined,
        agencyId: row.agencyId?.trim() || currentUser.agencyId,
        roleId: "role-employee",
        status: "ACTIVE",
        failedLoginAttempts: 0,
      };

      db.users.push(newUser);
      imported++;
    }

    // ── Persistance et journalisation ────────────────────────────────────
    if (imported > 0) {
      db.scheduleSave();
    }

    addAuditLog(
      db,
      currentUser.id,
      "IMPORT_MASSE",
      "Employés",
      `${imported} importé(s), ${skipped} ignoré(s) sur ${rows.length} lignes`,
      req.ip || "127.0.0.1"
    );

    return res.json({
      success: true,
      data: { imported, skipped, errors },
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/import/documents — Import en masse de métadonnées de documents
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/import/documents", (req: Request, res: Response) => {
    const currentUser = getReqUser(req);
    const body = req.body as { rows?: DocumentRow[]; data?: DocumentRow[] };
    const rows = body.rows || body.data;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Le champ « rows » ou « data » est requis et doit être un tableau non vide.",
      });
    }

    const errors: string[] = [];
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const lineLabel = `Ligne ${i + 1}`;

      // ── Validation du nom de fichier (champ obligatoire) ───────────────
      if (!row.originalFileName || typeof row.originalFileName !== "string" || !row.originalFileName.trim()) {
        errors.push(`${lineLabel} : nom de fichier (originalFileName) manquant ou invalide.`);
        skipped++;
        continue;
      }

      const fileNameClean = row.originalFileName.trim();

      // ── Vérification du type de document s'il est renseigné ────────────
      if (row.documentTypeId && typeof row.documentTypeId === "string") {
        const typeExists = db.documentTypes.some(
          (dt) => dt.id === row.documentTypeId
        );
        if (!typeExists) {
          errors.push(`${lineLabel} : type de document « ${row.documentTypeId} » introuvable.`);
          skipped++;
          continue;
        }
      }

      // ── Création de l'entrée document ──────────────────────────────────
      const newDoc: Record<string, unknown> = {
        id: generateId("doc"),
        originalFileName: fileNameClean,
        documentTypeId: row.documentTypeId?.trim() || null,
        description: row.description?.trim() || "",
        mimeType: row.mimeType?.trim() || "application/octet-stream",
        fileSize: 0,
        agencyId: row.agencyId?.trim() || currentUser.agencyId,
        uploadedBy: currentUser.id,
        uploadDate: new Date().toISOString(),
        version: 1,
        isDeleted: false,
        isArchived: false,
        folderId: null,
        storagePath: null,
      };

      db.documents.push(newDoc);
      imported++;
    }

    // ── Persistance et journalisation ────────────────────────────────────
    if (imported > 0) {
      db.scheduleSave();
    }

    addAuditLog(
      db,
      currentUser.id,
      "IMPORT_MASSE",
      "Documents",
      `${imported} importé(s), ${skipped} ignoré(s) sur ${rows.length} lignes`,
      req.ip || "127.0.0.1"
    );

    return res.json({
      success: true,
      data: { imported, skipped, errors },
    });
  });
}
