import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import path from "path";
import fs from "fs";
import os from "os";
import { createApp } from "../../server/app.ts";

import type { Express } from "express";

describe("API Auth — GRH BANQUE", () => {
  let app: Express;
  let token: string;

  beforeAll(async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "grh-test-"));
    process.env.DATA_DIR = tmpDir;
    process.env.JWT_SECRET = "test-secret";
    delete process.env.DATABASE_URL;
    delete process.env.POSTGRES_ENABLED;
    const created = await createApp();
    app = created.app;
  });

  it("refuse l'accès sans jeton JWT", async () => {
    const res = await request(app).get("/api/employees");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("refuse un login avec mot de passe incorrect", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ matricule: "aime.mbili@afgbank.ga", password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("authentifie avec email et mot de passe valides", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ matricule: "aime.mbili@afgbank.ga", password: "123" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.user.roleName).toBe("SUPER_ADMIN");
    token = res.body.data.accessToken;
  });

  it("retourne le profil courant avec un JWT valide", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("aime.mbili@afgbank.ga");
  });

  it("liste les employés avec un JWT valide", async () => {
    const res = await request(app)
      .get("/api/employees")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("expose la documentation OpenAPI avec authentification", async () => {
    const res = await request(app)
      .get("/api-docs")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.0.3");
  });
});
