// server/store/postgres.store.ts

import pg from "pg";
import type { CollectionName, StorePayload } from "./collections.js";
import { COLLECTION_TABLES, COLLECTIONS, emptyPayload } from "./collections.js";

const { Pool } = pg;

function getConnectionString(): string | null {
  // Railway provides DATABASE_URL automatically when PostgreSQL is attached
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  
  // Fallback for individual Railway PostgreSQL env vars (rare cases)
  if (process.env.PGHOST && !process.env.DATABASE_URL && process.env.PGUSER) {
    return `postgresql://${encodeURIComponent(process.env.PGUSER)}:${encodeURIComponent(process.env.PGPASSWORD || "")}@${process.env.PGHOST}:${process.env.PGPORT || "5432"}/${process.env.PGDATABASE || "railway"}`;
  }
  
  // Local development config
  if (process.env.POSTGRES_ENABLED !== "true") return null;
  const host = process.env.POSTGRES_HOST ?? "localhost";
  const port = process.env.POSTGRES_PORT ?? "5432";
  const db = process.env.POSTGRES_DB ?? "archives_rh";
  const user = process.env.POSTGRES_USER ?? "postgres";
  const password = process.env.POSTGRES_PASSWORD ?? "Postgres123";
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${db}`;
}

let pool: pg.Pool | null = null;
let schemaReady = false;

function getPool(): pg.Pool | null {
  const conn = getConnectionString();
  if (!conn) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: conn,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 2_000,
    });
    pool.on("error", (err) => console.error("[PostgreSQL] Pool error:", err.message));
  }
  return pool;
}

async function ensureIndexes(client: pg.PoolClient, table: string): Promise<void> {
  await client.query(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_${table.replace("grh_", "")}_data
    ON ${table} USING GIN (data)
  `);
  if (table === "grh_users") {
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grh_users_email ON grh_users ((data->>'email'))
    `);
  }
  if (table === "grh_documents") {
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grh_documents_status ON grh_documents ((data->>'status'))
    `);
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grh_documents_agency ON grh_documents ((data->>'agencyId'))
    `);
  }
}

export const pgStore = {
  isEnabled(): boolean {
    return getConnectionString() !== null;
  },

  async ensureSchema(): Promise<void> {
    const p = getPool();
    if (!p || schemaReady) return;

    const client = await p.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS grh_sync_meta (
          id TEXT PRIMARY KEY DEFAULT 'main',
          last_sync_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          source TEXT NOT NULL DEFAULT 'express'
        )
      `);

      for (const table of Object.values(COLLECTION_TABLES)) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS ${table} (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT now()
          )
        `);
        await ensureIndexes(client, table);
      }
      schemaReady = true;
    } finally {
      client.release();
    }
  },

  async upsert(collection: CollectionName, id: string, data: Record<string, unknown>): Promise<void> {
    const p = getPool();
    if (!p) return;
    const table = COLLECTION_TABLES[collection];
    await this.ensureSchema();
    await p.query(
      `INSERT INTO ${table} (id, data, updated_at) VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [id, JSON.stringify(data)]
    );
  },

  async remove(collection: CollectionName, id: string): Promise<void> {
    const p = getPool();
    if (!p) return;
    const table = COLLECTION_TABLES[collection];
    await this.ensureSchema();
    await p.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  },

  async get(collection: CollectionName, id: string): Promise<Record<string, unknown> | null> {
    const p = getPool();
    if (!p) return null;
    const table = COLLECTION_TABLES[collection];
    await this.ensureSchema();
    const result = await p.query<{ data: Record<string, unknown> }>(
      `SELECT data FROM ${table} WHERE id = $1`,
      [id]
    );
    return result.rows[0]?.data ?? null;
  },

  async list(
    collection: CollectionName,
    filters?: Record<string, string | undefined>
  ): Promise<Record<string, unknown>[]> {
    const p = getPool();
    if (!p) return [];
    const table = COLLECTION_TABLES[collection];
    await this.ensureSchema();

    const conditions: string[] = [];
    const values: string[] = [];
    let i = 1;
    if (filters) {
      for (const [key, val] of Object.entries(filters)) {
        if (val !== undefined && val !== "") {
          conditions.push(`data->>'${key.replace(/'/g, "")}' = $${i++}`);
          values.push(val);
        }
      }
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await p.query<{ data: Record<string, unknown> }>(
      `SELECT data FROM ${table} ${where} ORDER BY updated_at DESC`,
      values
    );
    return result.rows.map((r) => r.data);
  },

  async saveAll(payload: StorePayload): Promise<void> {
    const p = getPool();
    if (!p) return;

    await this.ensureSchema();
    const client = await p.connect();
    try {
      await client.query("BEGIN");
      for (const key of COLLECTIONS) {
        const table = COLLECTION_TABLES[key];
        const items = payload[key] ?? [];
        const ids = items.map((item) => String(item.id));
        if (ids.length === 0) {
          await client.query(`DELETE FROM ${table}`);
        } else {
          await client.query(`DELETE FROM ${table} WHERE NOT (id = ANY($1::text[]))`, [ids]);
          for (const item of items) {
            await client.query(
              `INSERT INTO ${table} (id, data, updated_at) VALUES ($1, $2::jsonb, NOW())
               ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
              [String(item.id), JSON.stringify(item)]
            );
          }
        }
      }
      await client.query(
        `INSERT INTO grh_sync_meta (id, last_sync_at, source) VALUES ('main', NOW(), 'express')
         ON CONFLICT (id) DO UPDATE SET last_sync_at = NOW()`
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async loadAll(): Promise<StorePayload | null> {
    const p = getPool();
    if (!p) return null;

    await this.ensureSchema();
    const payload = emptyPayload();
    let total = 0;

    for (const key of COLLECTIONS) {
      const table = COLLECTION_TABLES[key];
      const result = await p.query<{ data: Record<string, unknown> }>(
        `SELECT data FROM ${table} ORDER BY updated_at DESC`
      );
      payload[key] = result.rows.map((r) => r.data);
      total += result.rows.length;
    }
    return total > 0 ? payload : null;
  },

  async ping(): Promise<boolean> {
    const p = getPool();
    if (!p) return false;
    try {
      await p.query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  },

  async close(): Promise<void> {
    if (pool) {
      await pool.end();
      pool = null;
      schemaReady = false;
    }
  },
};
