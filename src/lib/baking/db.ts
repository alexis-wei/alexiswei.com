import { mkdirSync } from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";

// Without Turso credentials (local dev), data lives in a SQLite file here,
// next to locally stored uploads. Both are gitignored.
export const LOCAL_DIR = path.join(process.cwd(), ".baking-local");

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS logs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '',
    baked_on TEXT NOT NULL,
    process TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    timeline TEXT NOT NULL DEFAULT '[]',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS ingredients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image_key TEXT,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS log_ingredients (
    log_id TEXT NOT NULL,
    ingredient_id TEXT NOT NULL,
    amount TEXT NOT NULL DEFAULT '',
    position INTEGER NOT NULL,
    PRIMARY KEY (log_id, ingredient_id)
  )`,
  `CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    log_id TEXT NOT NULL,
    key TEXT NOT NULL,
    kind TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    position INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS media_log ON media (log_id, position)`,
  `CREATE INDEX IF NOT EXISTS log_ingredients_log ON log_ingredients (log_id, position)`,
];

let client: Client | undefined;
let ready: Promise<void> | undefined;

function getClient() {
  if (client) return client;
  let url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("TURSO_DATABASE_URL is not set");
    }
    mkdirSync(LOCAL_DIR, { recursive: true });
    url = `file:${path.join(LOCAL_DIR, "baking.db")}`;
  }
  client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return client;
}

/** Returns the database client, creating tables on first use per instance. */
export async function db() {
  const c = getClient();
  ready ??= c
    .batch(SCHEMA, "write")
    .then(() => undefined)
    .catch((error) => {
      ready = undefined;
      throw error;
    });
  await ready;
  return c;
}
