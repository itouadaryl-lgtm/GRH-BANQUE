import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import path from "path";
import fs from "fs";
import os from "os";
import { createApp } from "../../server/app.ts";
import type { Express } from "express";

describe("API CRUD — GRH BANQUE Entities", () => {
  let app: Express;
  let token: string;

  // IDs créés lors des tests
  let createdEmployeeId: string;
  let createdDocumentId: string;
  let createdFolderId: string;
  let createdAgencyId: string;

  beforeAll(async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "grh-crud-test-"));
    process.env.DATA_DIR = tmpDir;
    process.env.JWT_SECRET = "test-crud-secret";
    delete process.env.DATABASE_URL;
    delete process.env.POSTGRES_ENABLED;

    const created = await createApp();
    app = created.app;

    // Authentification SUPER_ADMIN
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ matricule: "aime.mbili@afgbank.ga", password: "123" });

    expect(loginRes.status).toBe(200);
    token = loginRes.body.data.accessToken;
  }, 30000);

  // ─── EMPLOYEES ────────────────────────────────────────────────────
  describe("Employés (Users)", () => {
    it("GET /api/employees — liste les employés", async () => {
      const res = await request(app)
        .get("/api/employees")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("POST /api/employees — crée un nouvel employé", async () => {
      const payload = {
        matricule: `TEST-${Date.now()}`,
        firstName: "Jean-Baptiste",
        lastName: "NKOGHE",
        email: `jb.nkoghe.${Date.now()}@afgbank.ga`,
        phone: "+241 07 123 456",
        birthDate: "1990-03-15",
        hireDate: "2022-01-10",
        department: "Direction Financière",
        position: "Analyste Risque Senior",
        agencyId: "ag-siege",
        roleId: "role-agent-admin",
      };

      const res = await request(app)
        .post("/api/employees")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe("Jean-Baptiste");
      createdEmployeeId = res.body.data.id;
    });

    it("PUT /api/employees/:id — met à jour un employé", async () => {
      expect(createdEmployeeId).toBeDefined();
      const res = await request(app)
        .put(`/api/employees/${createdEmployeeId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ position: "Directeur Risques & Conformité" });

      expect(res.status).toBe(200);
      expect(res.body.data.position).toBe("Directeur Risques & Conformité");
    });

    it("DELETE /api/employees/:id — supprime un employé", async () => {
      expect(createdEmployeeId).toBeDefined();
      const res = await request(app)
        .delete(`/api/employees/${createdEmployeeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ─── DOCUMENTS ────────────────────────────────────────────────────
  describe("Documents", () => {
    it("GET /api/documents — liste les documents", async () => {
      const res = await request(app)
        .get("/api/documents")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("POST /api/documents — indexe un nouveau document", async () => {
      const payload = {
        originalFileName: "Contrat_CDI_NKOGHE_2025.pdf",
        documentTypeId: "dt-contrat",
        description: "Contrat à durée indéterminée - Signé en 2025",
        fileSize: 1_024_000,
        mimeType: "application/pdf",
      };

      const res = await request(app)
        .post("/api/documents")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.originalFileName).toBe("Contrat_CDI_NKOGHE_2025.pdf");
      createdDocumentId = res.body.data.id;
    });

    it("PUT /api/documents/:id — met à jour un document", async () => {
      expect(createdDocumentId).toBeDefined();
      const res = await request(app)
        .put(`/api/documents/${createdDocumentId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ description: "Contrat CDI révisé - Version Finale" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("DELETE /api/documents/:id — met le document en corbeille", async () => {
      expect(createdDocumentId).toBeDefined();
      const res = await request(app)
        .delete(`/api/documents/${createdDocumentId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("POST /api/documents/:id/restore — restaure depuis la corbeille", async () => {
      expect(createdDocumentId).toBeDefined();
      const res = await request(app)
        .post(`/api/documents/${createdDocumentId}/restore`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("DELETE /api/documents/:id/permanent — purge définitivement", async () => {
      expect(createdDocumentId).toBeDefined();
      const res = await request(app)
        .delete(`/api/documents/${createdDocumentId}/permanent`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ─── FOLDERS ─────────────────────────────────────────────────────
  describe("Dossiers (Folders)", () => {
    it("GET /api/folders — liste les dossiers", async () => {
      const res = await request(app)
        .get("/api/folders")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("POST /api/folders — crée un dossier RH", async () => {
      const payload = {
        name: "Dossier Comptabilité 2026",
        type: "ADMINISTRATIF",
        agencyId: "ag-siege",
        description: "Classeur financier pour les pièces comptables annuelles",
      };

      const res = await request(app)
        .post("/api/folders")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      createdFolderId = res.body.data.id;
    });

    it("PUT /api/folders/:id — met à jour un dossier", async () => {
      expect(createdFolderId).toBeDefined();
      const res = await request(app)
        .put(`/api/folders/${createdFolderId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ description: "Classeur 2026 — Mise à jour trimestrielle" });

      expect(res.status).toBe(200);
    });

    it("DELETE /api/folders/:id — supprime un dossier", async () => {
      expect(createdFolderId).toBeDefined();
      const res = await request(app)
        .delete(`/api/folders/${createdFolderId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });

  // ─── AGENCIES ─────────────────────────────────────────────────────
  describe("Agences (Agencies)", () => {
    it("GET /api/agencies — liste les agences", async () => {
      const res = await request(app)
        .get("/api/agencies")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("POST /api/agencies — crée une agence", async () => {
      const payload = {
        code: `AG-TEST-${Date.now().toString().slice(-5)}`,
        name: "AFG BANK - Agence Test Moanda",
        address: "Boulevard du Développement, Centre-Ville",
        city: "Moanda",
        phone: "+241 06 900 000",
        email: "moanda.test@afgbank.ga",
        isHeadOffice: false,
        isActive: true,
      };

      const res = await request(app)
        .post("/api/agencies")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      createdAgencyId = res.body.data.id;
    });

    it("PUT /api/agencies/:id — met à jour une agence", async () => {
      expect(createdAgencyId).toBeDefined();
      const res = await request(app)
        .put(`/api/agencies/${createdAgencyId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ city: "Moanda - Haut-Ogooué" });

      expect(res.status).toBe(200);
    });

    it("DELETE /api/agencies/:id — supprime une agence", async () => {
      expect(createdAgencyId).toBeDefined();
      const res = await request(app)
        .delete(`/api/agencies/${createdAgencyId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });

  // ─── ROLES ─────────────────────────────────────────────────────────
  describe("Rôles & Permissions", () => {
    it("GET /api/roles — liste les rôles système", async () => {
      const res = await request(app)
        .get("/api/roles")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("GET /api/permissions — liste les permissions", async () => {
      const res = await request(app)
        .get("/api/permissions")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ─── SECURITY ─────────────────────────────────────────────────────
  describe("Sécurité & Contrôle d'Accès", () => {
    it("rejette les requêtes sans jeton (401)", async () => {
      const res = await request(app).get("/api/employees");
      expect(res.status).toBe(401);
    });

    it("rejette un jeton JWT invalide (401)", async () => {
      const res = await request(app)
        .get("/api/employees")
        .set("Authorization", "Bearer JETON_INVALIDE_TEST");

      expect(res.status).toBe(401);
    });

    it("GET /api/health — retourne le statut du système", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ─── AUDIT LOG ────────────────────────────────────────────────────
  describe("Journal d'Audit", () => {
    it("GET /api/activity-logs — liste les logs d'audit", async () => {
      const res = await request(app)
        .get("/api/activity-logs")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
