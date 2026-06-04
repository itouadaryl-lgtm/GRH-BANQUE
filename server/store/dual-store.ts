// server/store/dual-store.ts

import { createSeedData } from "../data/seed.js";
import type { CollectionName, StorePayload } from "./collections.js";
import { COLLECTIONS, emptyPayload } from "./collections.js";
import { JsonStore } from "./json.store.js";
import { pgStore } from "./postgres.store.js";

export class DualStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DualStoreError";
  }
}

export type HealthStatus = {
  pg: "ok" | "down";
  json: "ok" | "error";
  mode: "dual" | "pg-only" | "json-only";
};

export class DualStore {
  private json: JsonStore;
  private pgAvailable = false;
  private cache: StorePayload;

  private constructor(json: JsonStore, cache: StorePayload) {
    this.json = json;
    this.cache = cache;
  }

  static async create(storePath?: string): Promise<DualStore> {
    const json = new JsonStore(storePath);
    let cache = json.getCache();
    const hasJsonData = COLLECTIONS.some((c) => cache[c].length > 0);

    if (pgStore.isEnabled()) {
      const reachable = await pgStore.ping();
      if (reachable) {
        await pgStore.ensureSchema();
        const fromPg = await pgStore.loadAll();
        if (fromPg && !hasJsonData) {
          cache = fromPg;
          json.writeSync(cache);
          console.log("[DualStore] ✅ Données chargées depuis PostgreSQL → JSON");
        } else if (hasJsonData) {
          await pgStore.saveAll(cache);
        }
      }
    }

    if (!COLLECTIONS.some((c) => cache[c].length > 0)) {
      const seed = createSeedData() as unknown as StorePayload;
      for (const key of COLLECTIONS) {
        if (seed[key]?.length) cache[key] = seed[key];
      }
      json.writeSync(cache);
      if (pgStore.isEnabled() && (await pgStore.ping())) {
        await pgStore.saveAll(cache);
      }
    }

    const store = new DualStore(json, cache);
    await store.refreshPgStatus();
    store.logMode();
    return store;
  }

  private async refreshPgStatus(): Promise<void> {
    this.pgAvailable = pgStore.isEnabled() && (await pgStore.ping());
  }

  private logMode(): void {
    const jsonOk = this.json.healthCheck() === "ok";
    if (this.pgAvailable && jsonOk) {
      console.log("[DualStore] ✅ Persistance double active — JSON + PostgreSQL synchronisés");
    } else if (jsonOk) {
      console.log("[DualStore] ⚠️  Mode dégradé — JSON seul (PostgreSQL injoignable)");
    } else if (this.pgAvailable) {
      console.log("[DualStore] ⚠️  Mode dégradé — PostgreSQL seul (JSON injoignable)");
    }
  }

  getCache(): StorePayload {
    return this.cache;
  }

  async healthCheck(): Promise<HealthStatus> {
    await this.refreshPgStatus();
    const jsonStatus = this.json.healthCheck();
    const pgStatus = this.pgAvailable ? "ok" : "down";
    let mode: HealthStatus["mode"] = "json-only";
    if (this.pgAvailable && jsonStatus === "ok") mode = "dual";
    else if (this.pgAvailable) mode = "pg-only";
    return { pg: pgStatus, json: jsonStatus, mode };
  }

  async set(collection: CollectionName, id: string, data: Record<string, unknown>): Promise<void> {
    const list = this.cache[collection];
    const idx = list.findIndex((item) => String(item.id) === id);
    if (idx >= 0) list[idx] = data;
    else list.push(data);

    const results = await Promise.allSettled([
      Promise.resolve().then(() => this.json.setItem(collection, id, data)),
      this.pgAvailable ? pgStore.upsert(collection, id, data) : Promise.resolve(),
    ]);

    const jsonFailed = results[0].status === "rejected";
    const pgFailed = results[1].status === "rejected";
    if (jsonFailed) console.warn("[DualStore] JSON write failed:", (results[0] as PromiseRejectedResult).reason);
    if (pgFailed) console.warn("[DualStore] PG write failed:", (results[1] as PromiseRejectedResult).reason);
    if (jsonFailed && pgFailed) throw new DualStoreError(`Échec écriture dual sur ${collection}/${id}`);
  }

  async delete(collection: CollectionName, id: string): Promise<void> {
    this.cache[collection] = this.cache[collection].filter((item) => String(item.id) !== id);
    const results = await Promise.allSettled([
      Promise.resolve().then(() => this.json.deleteItem(collection, id)),
      this.pgAvailable ? pgStore.remove(collection, id) : Promise.resolve(),
    ]);
    if (results[0].status === "rejected" && results[1].status === "rejected") {
      throw new DualStoreError(`Échec suppression dual sur ${collection}/${id}`);
    }
  }

  async get(collection: CollectionName, id: string): Promise<Record<string, unknown> | null> {
    if (this.pgAvailable) {
      try {
        const row = await pgStore.get(collection, id);
        if (row) return row;
      } catch {
        /* fallback JSON */
      }
    }
    return this.cache[collection].find((item) => String(item.id) === id) ?? null;
  }

  async list(
    collection: CollectionName,
    filters?: Record<string, string | undefined>
  ): Promise<Record<string, unknown>[]> {
    if (this.pgAvailable) {
      try {
        return await pgStore.list(collection, filters);
      } catch {
        /* fallback */
      }
    }
    let items = [...this.cache[collection]];
    if (filters) {
      items = items.filter((item) =>
        Object.entries(filters).every(([k, v]) => !v || String(item[k]) === v)
      );
    }
    return items;
  }

  async sync(): Promise<void> {
    this.json.flush();
    if (this.pgAvailable) {
      await pgStore.saveAll(this.cache);
      console.log("[DualStore] Sync JSON → PostgreSQL terminée");
    }
  }

  scheduleSave(): void {
    this.json.replaceAll(this.cache);
    if (this.pgAvailable) {
      void pgStore.saveAll(this.cache).catch((err: Error) =>
        console.warn("[DualStore] Sync PG différée échouée:", err.message)
      );
    }
  }

  async saveNow(): Promise<void> {
    this.json.flush();
    if (this.pgAvailable) await pgStore.saveAll(this.cache);
  }

  async init(): Promise<void> {
    await this.refreshPgStatus();
    if (this.pgAvailable) await pgStore.saveAll(this.cache);
    this.logMode();
  }
}

export type StoreUser = {
  id: string;
  matricule: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  fullName: string;
  photoUrl?: string;
  phone?: string;
  birthDate?: string;
  hireDate?: string;
  department?: string;
  position?: string;
  agencyId: string;
  roleId: string;
  status: string;
  failedLoginAttempts: number;
};
