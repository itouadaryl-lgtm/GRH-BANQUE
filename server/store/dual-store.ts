// server/store/dual-store.ts

import { createSeedData } from "../data/seed.js";
import type { CollectionName, StorePayload } from "./collections.js";
import { COLLECTIONS, emptyPayload } from "./collections.js";
import { JsonStore } from "./json.store.js";
import { pgStore } from "./postgres.store.js";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT === "production";
}

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

    const pgEnabled = pgStore.isEnabled();

    if (pgEnabled) {
      const reachable = await pgStore.ping();
      if (!reachable) {
        if (isProduction()) {
          throw new DualStoreError("PostgreSQL injoignable au démarrage — service indisponible");
        }
        console.error("[DualStore] ❌ PostgreSQL injoignable — continuation en mode JSON-only (non-production)");
      } else {
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
      if (pgEnabled) {
        const reachable = await pgStore.ping();
        if (reachable) {
          await pgStore.saveAll(cache);
        } else if (isProduction()) {
          throw new DualStoreError("PostgreSQL injoignable — impossible de synchroniser les données initiales");
        }
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
      if (isProduction()) {
        console.error("[DualStore] ❌ MODE DÉGRADÉ — JSON seul en production (PostgreSQL injoignable)");
      } else {
        console.log("[DualStore] ⚠️  Mode dégradé — JSON seul (PostgreSQL injoignable)");
      }
    } else if (this.pgAvailable) {
      console.log("[DualStore] ⚠️  Mode dégradé — PostgreSQL seul (JSON injoignable)");
    } else {
      if (isProduction()) {
        console.error("[DualStore] ❌ ERREUR CRITIQUE — Aucun stockage disponible en production");
      }
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

    if (isProduction() && mode === "json-only") {
      console.error("[DualStore] ❌ Santé: PostgreSQL DOWN en production — ALERTE");
    }

    return { pg: pgStatus, json: jsonStatus, mode };
  }

  async set(collection: CollectionName, id: string, data: Record<string, unknown>): Promise<void> {
    const list = this.cache[collection];
    const idx = list.findIndex((item) => String(item.id) === id);
    if (idx >= 0) list[idx] = data;
    else list.push(data);

    const jsonPromise = Promise.resolve().then(() => this.json.setItem(collection, id, data));
    const pgPromise = this.pgAvailable ? pgStore.upsert(collection, id, data) : Promise.resolve();

    const [jsonResult, pgResult] = await Promise.allSettled([jsonPromise, pgPromise]);

    const jsonFailed = jsonResult.status === "rejected";
    const pgFailed = pgResult.status === "rejected";

    if (jsonFailed) {
      console.error("[DualStore] JSON write failed:", (jsonResult as PromiseRejectedResult).reason);
    }
    if (pgFailed) {
      console.error("[DualStore] PG write failed:", (pgResult as PromiseRejectedResult).reason);
    }

    if (jsonFailed && pgFailed) {
      throw new DualStoreError(`Échec écriture dual sur ${collection}/${id}`);
    }

    if (pgFailed && isProduction()) {
      console.error(`[DualStore] ❌ Écriture PostgreSQL échouée en production: ${collection}/${id}`);
    }
  }

  async delete(collection: CollectionName, id: string): Promise<void> {
    this.cache[collection] = this.cache[collection].filter((item) => String(item.id) !== id);
    const jsonPromise = Promise.resolve().then(() => this.json.deleteItem(collection, id));
    const pgPromise = this.pgAvailable ? pgStore.remove(collection, id) : Promise.resolve();

    const results = await Promise.allSettled([jsonPromise, pgPromise]);

    if (results[0].status === "rejected" && results[1].status === "rejected") {
      throw new DualStoreError(`Échec suppression dual sur ${collection}/${id}`);
    }

    if (results[1].status === "rejected" && isProduction()) {
      console.error(`[DualStore] ❌ Suppression PostgreSQL échouée en production: ${collection}/${id}`);
    }
  }

  async get(collection: CollectionName, id: string): Promise<Record<string, unknown> | null> {
    if (this.pgAvailable) {
      try {
        const row = await pgStore.get(collection, id);
        if (row) return row;
      } catch (err) {
        console.error(`[DualStore] PG get failed: ${collection}/${id}`, err);
        if (isProduction()) {
          console.error(`[DualStore] ❌ Lecture PostgreSQL échouée en production: ${collection}/${id}`);
        }
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
      } catch (err) {
        console.error(`[DualStore] PG list failed: ${collection}`, err);
        if (isProduction()) {
          console.error(`[DualStore] ❌ Liste PostgreSQL échouée en production: ${collection}`);
        }
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
      try {
        await pgStore.saveAll(this.cache);
        console.log("[DualStore] Sync JSON → PostgreSQL terminée");
      } catch (err) {
        console.error("[DualStore] ❌ Sync PostgreSQL échouée:", err);
        if (isProduction()) {
          throw new DualStoreError(`Échec synchronisation PostgreSQL en production: ${err}`);
        }
      }
    } else if (isProduction()) {
      console.error("[DualStore] ❌ Sync impossible — PostgreSQL DOWN en production");
    }
  }

  scheduleSave(): void {
    this.json.replaceAll(this.cache);
    if (this.pgAvailable) {
      void pgStore.saveAll(this.cache).catch((err: Error) =>
        console.error("[DualStore] ❌ Sync PG différée échouée:", err.message)
      );
    }
  }

  async saveNow(): Promise<void> {
    this.json.flush();
    if (this.pgAvailable) {
      try {
        await pgStore.saveAll(this.cache);
      } catch (err) {
        console.error("[DualStore] ❌ saveNow PostgreSQL échouée:", err);
        if (isProduction()) {
          throw new DualStoreError(`Échec saveNow PostgreSQL en production: ${err}`);
        }
      }
    }
  }

  async init(): Promise<void> {
    await this.refreshPgStatus();
    if (this.pgAvailable) {
      try {
        await pgStore.saveAll(this.cache);
      } catch (err) {
        console.error("[DualStore] ❌ init PostgreSQL échouée:", err);
        if (isProduction()) {
          throw new DualStoreError(`Échec initialisation PostgreSQL en production: ${err}`);
        }
      }
    }
    this.logMode();
  }
}
