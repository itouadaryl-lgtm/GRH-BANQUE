// server/routes/export.routes.ts
// § 4 — Export Excel (ExcelJS) + CSV natif pour Employés, Documents, Logs d'Audit

import type { Express, Request, Response } from "express";
import type { Database } from "../store/database.js";
import { getReqUser, checkIsVoirTout } from "../middleware/auth.js";
import ExcelJS from "exceljs";
import { addAuditLog } from "../services/audit.service.js";

// ─── Helper: style de cellule header premium ──────────────────────────────
function applyHeaderStyle(row: ExcelJS.Row, fillColor: string = "0052CC") {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF" + fillColor },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "medium", color: { argb: "FFCCCCCC" } },
    };
  });
  row.height = 22;
}

export function registerExportRoutes(app: Express, db: Database): void {
  // ─── EXPORT EMPLOYÉS — Excel ─────────────────────────────────────────────
  app.get("/api/export/employees/xlsx", async (req: Request, res: Response) => {
    const currentUser = getReqUser(req);
    const isVoirTout = checkIsVoirTout(req, currentUser, db);

    let users = db.users;
    if (!isVoirTout) {
      users = users.filter((u) => u.agencyId === currentUser.agencyId);
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "GRH BANQUE — AFG Bank Gabon";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Collaborateurs", {
      pageSetup: { paperSize: 9, orientation: "landscape" },
    });

    // Titre principal
    sheet.mergeCells("A1:K1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = `AFG BANK GABON — Registre des Collaborateurs — Exporté le ${new Date().toLocaleDateString("fr-FR")}`;
    titleCell.font = { bold: true, size: 14, color: { argb: "FF0052CC" } };
    titleCell.alignment = { horizontal: "center" };
    sheet.getRow(1).height = 30;

    // En-têtes
    sheet.columns = [
      { key: "matricule", width: 18 },
      { key: "fullName", width: 28 },
      { key: "email", width: 30 },
      { key: "phone", width: 18 },
      { key: "position", width: 30 },
      { key: "department", width: 25 },
      { key: "agencyId", width: 20 },
      { key: "status", width: 14 },
      { key: "hireDate", width: 16 },
      { key: "birthDate", width: 16 },
      { key: "roleId", width: 18 },
    ];

    const headerRow = sheet.addRow({
      matricule: "MATRICULE",
      fullName: "NOM COMPLET",
      email: "EMAIL PROFESSIONNEL",
      phone: "TÉLÉPHONE",
      position: "POSTE",
      department: "DÉPARTEMENT",
      agencyId: "AGENCE",
      status: "STATUT",
      hireDate: "DATE D'EMBAUCHE",
      birthDate: "DATE DE NAISSANCE",
      roleId: "RÔLE SYSTÈME",
    });
    applyHeaderStyle(headerRow);

    // Données
    users.forEach((u, idx) => {
      const row = sheet.addRow({
        matricule: u.matricule || "—",
        fullName: u.fullName || `${u.firstName || ""} ${u.lastName || ""}`.trim(),
        email: u.email,
        phone: u.phone || "—",
        position: u.position || "—",
        department: u.department || "—",
        agencyId: u.agencyId,
        status: u.status,
        hireDate: u.hireDate || "—",
        birthDate: u.birthDate || "—",
        roleId: db.roles.find((r) => r.id === u.roleId)?.name || u.roleId,
      });

      // Zebra striping
      if (idx % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFF" },
          };
        });
      }
    });

    addAuditLog(db, currentUser.id, "EXPORT", "Employés", `${users.length} lignes exportées (Excel)`);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="AFG_Collaborateurs_${Date.now()}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  });

  // ─── EXPORT DOCUMENTS — Excel ────────────────────────────────────────────
  app.get("/api/export/documents/xlsx", async (req: Request, res: Response) => {
    const currentUser = getReqUser(req);
    const isVoirTout = checkIsVoirTout(req, currentUser, db);

    let docs = db.documents.filter((d) => !d.isDeleted);
    if (!isVoirTout) {
      docs = docs.filter((d) => d.agencyId === currentUser.agencyId);
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "GRH BANQUE — AFG Bank Gabon";

    const sheet = workbook.addWorksheet("Documents GED", {
      pageSetup: { paperSize: 9, orientation: "landscape" },
    });

    sheet.mergeCells("A1:H1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = `AFG BANK — Index des Documents GED — ${new Date().toLocaleDateString("fr-FR")}`;
    titleCell.font = { bold: true, size: 13, color: { argb: "FF0052CC" } };
    titleCell.alignment = { horizontal: "center" };
    sheet.getRow(1).height = 28;

    sheet.columns = [
      { key: "fileName", width: 40 },
      { key: "description", width: 35 },
      { key: "mimeType", width: 20 },
      { key: "fileSize", width: 14 },
      { key: "agencyId", width: 20 },
      { key: "version", width: 10 },
      { key: "uploadDate", width: 18 },
      { key: "status", width: 14 },
    ];

    const headerRow = sheet.addRow({
      fileName: "NOM DU FICHIER",
      description: "DESCRIPTION",
      mimeType: "TYPE MIME",
      fileSize: "TAILLE (KB)",
      agencyId: "AGENCE",
      version: "VERSION",
      uploadDate: "DATE D'INDEXATION",
      status: "STATUT",
    });
    applyHeaderStyle(headerRow, "004499");

    docs.forEach((d, idx) => {
      const row = sheet.addRow({
        fileName: d.originalFileName as string,
        description: (d.description as string) || "—",
        mimeType: d.mimeType as string,
        fileSize: Math.round((d.fileSize as number) / 1024),
        agencyId: d.agencyId as string,
        version: d.version as number || 1,
        uploadDate: d.uploadDate
          ? new Date(d.uploadDate as string).toLocaleDateString("fr-FR")
          : "—",
        status: d.isDeleted ? "SUPPRIMÉ" : "ACTIF",
      });

      if (idx % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F8FF" } };
        });
      }
    });

    addAuditLog(db, currentUser.id, "EXPORT", "Documents", `${docs.length} documents exportés (Excel)`);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="AFG_Documents_GED_${Date.now()}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  });

  // ─── EXPORT LOGS AUDIT — Excel ───────────────────────────────────────────
  app.get("/api/export/activity-logs/xlsx", async (req: Request, res: Response) => {
    const currentUser = getReqUser(req);
    const isVoirTout = checkIsVoirTout(req, currentUser, db);

    let logs = db.activityLogs;
    if (!isVoirTout) {
      logs = logs.filter((l) => l.agencyId === currentUser.agencyId);
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Journal d'Audit");

    sheet.columns = [
      { key: "timestamp", width: 22 },
      { key: "userId", width: 22 },
      { key: "action", width: 18 },
      { key: "resource", width: 20 },
      { key: "details", width: 50 },
      { key: "ipAddress", width: 18 },
    ];

    const headerRow = sheet.addRow({
      timestamp: "HORODATAGE",
      userId: "UTILISATEUR",
      action: "ACTION",
      resource: "RESSOURCE",
      details: "DÉTAILS",
      ipAddress: "ADRESSE IP",
    });
    applyHeaderStyle(headerRow, "1A1A2E");

    logs.forEach((l) => {
      sheet.addRow({
        timestamp: l.timestamp
          ? new Date(l.timestamp as string).toLocaleString("fr-FR")
          : "—",
        userId: db.users.find((u) => u.id === l.userId)?.fullName || (l.userId as string),
        action: l.action as string,
        resource: l.resource as string,
        details: typeof l.details === "object" ? JSON.stringify(l.details) : String(l.details || ""),
        ipAddress: (l.ipAddress as string) || "127.0.0.1",
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="AFG_AuditLog_${Date.now()}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  });

  // ─── EXPORT CSV RAPIDE — Employés ────────────────────────────────────────
  app.get("/api/export/employees/csv", (req: Request, res: Response) => {
    const currentUser = getReqUser(req);
    const isVoirTout = checkIsVoirTout(req, currentUser, db);

    let users = db.users;
    if (!isVoirTout) {
      users = users.filter((u) => u.agencyId === currentUser.agencyId);
    }

    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

    const header = ["MATRICULE", "NOM COMPLET", "EMAIL", "TELEPHONE", "POSTE", "DEPARTEMENT", "AGENCE", "STATUT", "DATE_EMBAUCHE"].map(escape).join(",");
    const rows = users.map((u) =>
      [
        u.matricule,
        u.fullName || `${u.firstName || ""} ${u.lastName || ""}`.trim(),
        u.email,
        u.phone || "",
        u.position || "",
        u.department || "",
        u.agencyId,
        u.status,
        u.hireDate || "",
      ]
        .map(escape)
        .join(",")
    );

    const csv = [header, ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="AFG_Collaborateurs_${Date.now()}.csv"`);
    res.send("\uFEFF" + csv); // BOM UTF-8 pour compatibilité Excel
  });
}
