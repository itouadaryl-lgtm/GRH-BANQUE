// server/store/json.store.ts

import fs from "fs";
import path from "path";
import type { CollectionName, StorePayload } from "./collections.js";
import { COLLECTIONS, emptyPayload } from "./collections.js";

export class JsonStore {
  private readonly storePath: string;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private cache: StorePayload;

  constructor(storePath?: string) {
    const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
    this.storePath = storePath ?? path.join(dataDir, "store.json");
    this.cache = this.readSync();
  }

  getCache(): StorePayload {
    return this.cache;
  }

  readSync(): StorePayload {
    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(this.storePath)) {
      return emptyPayload();
    }
    try {
      const raw = JSON.parse(fs.readFileSync(this.storePath, "utf-8")) as Partial<StorePayload>;
      const payload = emptyPayload();
      for (const key of COLLECTIONS) {
        payload[key] = (raw[key] as Record<string, unknown>[]) ?? [];
      }
      return payload;
    } catch {
      return emptyPayload();
    }
  }

  writeSync(payload: StorePayload): void {
    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.storePath, JSON.stringify(payload, null, 2), "utf-8");
    this.cache = payload;
  }

  setItem(collection: CollectionName, id: string, data: Record<string, unknown>): void {
    const list = this.cache[collection];
    const idx = list.findIndex((item) => String(item.id) === id);
    if (idx >= 0) list[idx] = data;
    else list.push(data);
    this.scheduleWrite();
  }

  deleteItem(collection: CollectionName, id: string): void {
    this.cache[collection] = this.cache[collection].filter((item) => String(item.id) !== id);
    this.scheduleWrite();
  }

  replaceCollection(collection: CollectionName, items: Record<string, unknown>[]): void {
    this.cache[collection] = items;
    this.scheduleWrite();
  }

  replaceAll(payload: StorePayload): void {
    this.cache = payload;
    this.scheduleWrite();
  }

  scheduleWrite(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      try {
        this.writeSync(this.cache);
      } catch (err) {
        console.error("[JsonStore] Échec écriture:", err);
        throw err;
      }
    }, 500);
  }

  flush(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    this.writeSync(this.cache);
  }

  healthCheck(): "ok" | "error" {
    try {
      const dir = path.dirname(this.storePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.accessSync(dir, fs.constants.W_OK);
      return "ok";
    } catch {
      return "error";
    }
  }
}
