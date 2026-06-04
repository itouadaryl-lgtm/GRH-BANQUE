import { describe, it, expect, beforeAll, afterAll } from "vitest";
import path from "path";
import fs from "fs";
import os from "os";
import { DualStore } from "../../server/store/dual-store.ts";

describe("DualStore", () => {
  let tmpDir: string;
  let store: DualStore;

  beforeAll(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "dualstore-test-"));
    process.env.DATA_DIR = tmpDir;
    delete process.env.DATABASE_URL;
    delete process.env.POSTGRES_ENABLED;
    store = await DualStore.create(path.join(tmpDir, "store.json"));
  });

  afterAll(async () => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("écrit et lit une entité en JSON (mode json-only)", async () => {
    const health = await store.healthCheck();
    expect(health.mode).toBe("json-only");

    await store.set("users", "u-test", {
      id: "u-test",
      email: "test@afgbank.ga",
      fullName: "Test User",
    });

    const item = await store.get("users", "u-test");
    expect(item?.email).toBe("test@afgbank.ga");
  });

  it("supprime une entité", async () => {
    await store.delete("users", "u-test");
    const item = await store.get("users", "u-test");
    expect(item).toBeNull();
  });

  it("persiste dans le fichier JSON", async () => {
    await store.set("agencies", "ag-test", { id: "ag-test", name: "Test Agency", code: "TST" });
    await store.saveNow();

    const raw = JSON.parse(fs.readFileSync(path.join(tmpDir, "store.json"), "utf-8"));
    const agency = raw.agencies.find((a: { id: string }) => a.id === "ag-test");
    expect(agency?.name).toBe("Test Agency");
  });

  it("liste avec filtres en mémoire", async () => {
    await store.set("documents", "doc-1", { id: "doc-1", agencyId: "ag-siege", status: "active" });
    await store.set("documents", "doc-2", { id: "doc-2", agencyId: "ag-lib", status: "active" });
    const filtered = await store.list("documents", { agencyId: "ag-siege" });
    expect(filtered.some((d) => d.id === "doc-1")).toBe(true);
    expect(filtered.some((d) => d.id === "doc-2")).toBe(false);
  });
});
