import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import path from "path";
import fs from "fs";
import os from "os";
import { createApp } from "../../server/app.ts";
import type { Express } from "express";

describe("API Import — GRH BANQUE", () => {
  let app: Express;
  let token: string;

  beforeAll(async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "grh-import-test-"));
    process.env.DATA_DIR = tmpDir;
    process.env.JWT_SECRET = "test-import-secret";
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

  describe("POST /api/import/employees", () => {
    it("importe avec succès des collaborateurs valides via l'attribut 'data'", async () => {
      const payload = {
        data: [
          {
            matricule: "AFG-IMP-001",
            firstName: "Prosper",
            lastName: "OBAME",
            email: "prosper.obame@afgbank.ga",
            phone: "+241 07 77 77 77",
            department: "Ressources Humaines",
            position: "Chargé de Recrutement",
            hireDate: "2026-06-01",
            birthDate: "1993-08-12",
          },
          {
            matricule: "AFG-IMP-002",
            firstName: "Bernadette",
            lastName: "MOUDOUMA",
            email: "bernadette.moudouma@afgbank.ga",
            phone: "+241 06 66 66 66",
            department: "Direction Générale",
            position: "Secrétaire de Cabinet",
            hireDate: "2025-10-15",
            birthDate: "1988-12-04",
          }
        ]
      };

      const res = await request(app)
        .post("/api/import/employees")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.imported).toBe(2);
      expect(res.body.data.skipped).toBe(0);
      expect(res.body.data.errors).toHaveLength(0);

      // Vérifier que les collaborateurs sont visibles dans l'annuaire
      const getRes = await request(app)
        .get("/api/employees")
        .set("Authorization", `Bearer ${token}`);

      expect(getRes.status).toBe(200);
      const employees = getRes.body.data;
      const prosper = employees.find((e: any) => e.matricule === "AFG-IMP-001");
      const bernadette = employees.find((e: any) => e.matricule === "AFG-IMP-002");

      expect(prosper).toBeDefined();
      expect(prosper.fullName).toBe("Prosper OBAME");
      expect(bernadette).toBeDefined();
      expect(bernadette.fullName).toBe("Bernadette MOUDOUMA");
    });

    it("sautent les collaborateurs invalides ou doublons", async () => {
      const payload = {
        data: [
          // Doublon de matricule
          {
            matricule: "AFG-IMP-001",
            firstName: "Doublon",
            lastName: "TEST",
            email: "doublon.email@afgbank.ga",
          },
          // Email invalide
          {
            matricule: "AFG-IMP-003",
            firstName: "Invalide",
            lastName: "EMAIL",
            email: "bad-email-format",
          },
          // Matricule manquant
          {
            firstName: "Manquant",
            lastName: "MATRICULE",
            email: "manquant.mat@afgbank.ga",
          }
        ]
      };

      const res = await request(app)
        .post("/api/import/employees")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.imported).toBe(0);
      expect(res.body.data.skipped).toBe(3);
      expect(res.body.data.errors.length).toBe(3);
      expect(res.body.data.errors[0]).toContain("existe déjà");
      expect(res.body.data.errors[1]).toContain("format invalide");
      expect(res.body.data.errors[2]).toContain("matricule manquant");
    });
  });

  describe("POST /api/import/documents", () => {
    it("importe avec succès des documents valides via l'attribut 'data'", async () => {
      const payload = {
        data: [
          {
            originalFileName: "Fiche_Poste_Recruteur.pdf",
            documentTypeId: "dt-contrat",
            description: "Fiche descriptive de poste importée",
          }
        ]
      };

      const res = await request(app)
        .post("/api/import/documents")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.imported).toBe(1);
      expect(res.body.data.skipped).toBe(0);

      // Vérifier que le document est visible
      const getRes = await request(app)
        .get("/api/documents")
        .set("Authorization", `Bearer ${token}`);

      expect(getRes.status).toBe(200);
      const docs = getRes.body.data;
      const fpDoc = docs.find((d: any) => d.originalFileName === "Fiche_Poste_Recruteur.pdf");
      expect(fpDoc).toBeDefined();
      expect(fpDoc.description).toBe("Fiche descriptive de poste importée");
    });
  });
});
