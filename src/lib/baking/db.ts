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
  // A recipe's source files (photos/PDFs), kept as the original upload.
  `CREATE TABLE IF NOT EXISTS recipe_files (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    content_type TEXT NOT NULL,
    size INTEGER,
    position INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    deleted_at INTEGER
  ) STRICT`,
  // One row per timeline step. Order is `position` within a log: moving or
  // inserting a step renumbers only that log's rows, in one transaction.
  // Positions may have gaps (after deletes); only their order matters.
  `CREATE TABLE IF NOT EXISTS timeline_steps (
    id TEXT PRIMARY KEY,
    log_id TEXT NOT NULL,
    position INTEGER NOT NULL,
    time TEXT NOT NULL DEFAULT '',
    text TEXT NOT NULL DEFAULT '',
    room_temp TEXT NOT NULL DEFAULT '',
    humidity TEXT NOT NULL DEFAULT '',
    internal_temp TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  ) STRICT`,
  `CREATE INDEX IF NOT EXISTS timeline_steps_log ON timeline_steps (log_id, position)`,
  // The recipe library. A recipe has an optional link, pasted text and files
  // (recipe_files.recipe_id), and can be used by any number of logs.
  `CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    url TEXT NOT NULL DEFAULT '',
    text TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER
  ) STRICT`,
  // Which recipes a log uses, in order (like log_ingredients).
  `CREATE TABLE IF NOT EXISTS log_recipes (
    log_id TEXT NOT NULL,
    recipe_id TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (log_id, recipe_id)
  ) STRICT`,
  `CREATE INDEX IF NOT EXISTS log_recipes_log ON log_recipes (log_id, position)`,
  `CREATE INDEX IF NOT EXISTS log_recipes_recipe ON log_recipes (recipe_id)`,
  // One-time data migrations that have run (see DATA_MIGRATIONS).
  `CREATE TABLE IF NOT EXISTS schema_migrations (
    name TEXT PRIMARY KEY,
    applied_at INTEGER NOT NULL
  ) STRICT`,
];

// Columns added after the first release. CREATE TABLE IF NOT EXISTS won't add
// them to existing databases, so they're added here when missing.
const ADDED_COLUMNS = [
  ["ingredients", "origin", "TEXT NOT NULL DEFAULT ''"],
  ["ingredients", "details", "TEXT NOT NULL DEFAULT ''"],
  ["ingredients", "source_key", "TEXT"],
  ["ingredients", "crop", "TEXT NOT NULL DEFAULT ''"],
  ["logs", "start_time", "TEXT NOT NULL DEFAULT ''"],
  ["logs", "end_time", "TEXT NOT NULL DEFAULT ''"],
  ["logs", "deleted_at", "INTEGER"],
  ["ingredients", "deleted_at", "INTEGER"],
  ["media", "deleted_at", "INTEGER"],
  ["media", "caption", "TEXT NOT NULL DEFAULT ''"],
  ["media", "taken_at", "TEXT"],
  ["logs", "cover_media_id", "TEXT"],
  // The timeline step a photo/video belongs to (one step per photo; a step
  // can have many). Linked by id, so reordering steps never loses the link.
  ["media", "step_id", "TEXT"],
  // The library recipe a file belongs to.
  ["recipe_files", "recipe_id", "TEXT"],
] as const;

// Indexes on added columns, created once the columns exist.
const LATE_INDEXES = [
  `CREATE INDEX IF NOT EXISTS recipe_files_recipe ON recipe_files (recipe_id, position)`,
];

// Columns that were removed. Their data is deleted for good, so only list a
// column here when that's intended. (logs.room_temp/humidity: the starting
// room conditions, replaced by per-step readings in the timeline.)
const DROPPED_COLUMNS = [
  ["logs", "room_temp"],
  ["logs", "humidity"],
] as const;

type Statement = { sql: string; args: (string | number | null)[] };

/**
 * One-time data migrations, each recorded in schema_migrations so it never
 * runs twice. A migration's statements and its record are written in one
 * transaction: if two server instances race, the second fails on the record's
 * primary key and rolls back, changing nothing.
 */
const DATA_MIGRATIONS: {
  name: string;
  statements: (c: Client) => Promise<Statement[]>;
}[] = [
  {
    // Steps used to live as JSON in logs.timeline. Copy them into
    // timeline_steps. (logs.timeline is dropped by a later migration.)
    name: "2026-10-timeline-steps",
    async statements(c) {
      if (!(await hasColumn(c, "logs", "timeline"))) return []; // new database
      const { rows } = await c.execute(
        "SELECT id, timeline, updated_at FROM logs",
      );
      const out: Statement[] = [];
      for (const row of rows) {
        let steps: Record<string, unknown>[] = [];
        try {
          const parsed = JSON.parse(String(row.timeline ?? "[]"));
          if (Array.isArray(parsed)) steps = parsed;
        } catch {
          continue;
        }
        steps.forEach((step, position) => {
          const text = (key: string) =>
            typeof step[key] === "string" ? (step[key] as string) : "";
          out.push({
            sql: `INSERT INTO timeline_steps
                  (id, log_id, position, time, text, room_temp, humidity, internal_temp, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              `${row.id}:${text("id") || position}`,
              String(row.id),
              position,
              text("time"),
              text("text"),
              text("roomTemp"),
              text("humidity"),
              text("internalTemp"),
              Number(row.updated_at) || Date.now(),
              Number(row.updated_at) || Date.now(),
            ],
          });
        });
      }
      return out;
    },
  },
  {
    // Recipes used to live on each log (recipe_url, recipe_text and
    // recipe_files.log_id). Each log that had any becomes a library recipe,
    // named after the log and linked to it. (The log columns are dropped by
    // a later migration.)
    name: "2026-10-recipe-library",
    async statements(c) {
      if (!(await hasColumn(c, "logs", "recipe_url"))) return []; // new database
      const { rows } = await c.execute(
        `SELECT id, title, recipe_url, recipe_text, created_at, updated_at
         FROM logs l
         WHERE recipe_url != '' OR recipe_text != ''
            OR EXISTS (SELECT 1 FROM recipe_files
                       WHERE log_id = l.id AND deleted_at IS NULL)`,
      );
      return rows.flatMap((row) => {
        const logId = String(row.id);
        const recipeId = `${logId}-recipe`;
        const created = Number(row.created_at) || Date.now();
        const updated = Number(row.updated_at) || created;
        return [
          {
            sql: `INSERT INTO recipes (id, name, url, text, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?)`,
            args: [
              recipeId,
              String(row.title ?? "").trim(),
              String(row.recipe_url ?? ""),
              String(row.recipe_text ?? ""),
              created,
              updated,
            ],
          },
          {
            sql: "INSERT INTO log_recipes (log_id, recipe_id, position) VALUES (?, ?, 0)",
            args: [logId, recipeId],
          },
          {
            sql: "UPDATE recipe_files SET recipe_id = ? WHERE log_id = ? AND recipe_id IS NULL",
            args: [recipeId, logId],
          },
        ];
      });
    },
  },
  {
    // The columns the two migrations above copied from, kept as a backup
    // until production was checked on the new tables. Listed after them, so
    // a database is only cleaned up once its data has been copied, in the
    // same run. Deletes that data for good.
    name: "2026-10-drop-pre-library-columns",
    async statements(c) {
      const out: Statement[] = [
        { sql: "DROP INDEX IF EXISTS recipe_files_log", args: [] },
      ];
      for (const [table, column] of [
        ["logs", "timeline"],
        ["logs", "recipe_url"],
        ["logs", "recipe_text"],
        ["recipe_files", "log_id"],
      ]) {
        if (await hasColumn(c, table, column)) {
          out.push({
            sql: `ALTER TABLE ${table} DROP COLUMN ${column}`,
            args: [],
          });
        }
      }
      return out;
    },
  },
];

async function hasColumn(c: Client, table: string, column: string) {
  const { rows } = await c.execute(`PRAGMA table_info(${table})`);
  return rows.some((row) => row.name === column);
}

async function runDataMigrations(c: Client) {
  const { rows } = await c.execute("SELECT name FROM schema_migrations");
  const done = new Set(rows.map((row) => String(row.name)));
  for (const migration of DATA_MIGRATIONS) {
    if (done.has(migration.name)) continue;
    const statements = await migration.statements(c);
    try {
      await c.batch(
        [
          ...statements,
          {
            sql: "INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)",
            args: [migration.name, Date.now()],
          },
        ],
        "write",
      );
    } catch (error) {
      // Another instance applied it first (its record, or a column it
      // dropped, is already there); this attempt was rolled back.
      const raced = ["UNIQUE", "no such column"];
      if (!raced.some((text) => String(error).includes(text))) throw error;
    }
  }
}

export async function migrate(c: Client) {
  await c.batch(SCHEMA, "write");
  for (const [table, column, type] of ADDED_COLUMNS) {
    const { rows } = await c.execute(`PRAGMA table_info(${table})`);
    if (rows.some((row) => row.name === column)) continue;
    try {
      await c.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    } catch (error) {
      // Another server instance added it at the same moment.
      if (!String(error).includes("duplicate column")) throw error;
    }
  }
  for (const [table, column] of DROPPED_COLUMNS) {
    const { rows } = await c.execute(`PRAGMA table_info(${table})`);
    if (!rows.some((row) => row.name === column)) continue;
    try {
      await c.execute(`ALTER TABLE ${table} DROP COLUMN ${column}`);
    } catch (error) {
      // Another server instance dropped it at the same moment.
      if (!String(error).includes("no such column")) throw error;
    }
  }
  await c.batch(LATE_INDEXES, "write");
  await runDataMigrations(c);
}

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
  ready ??= migrate(c).catch((error) => {
    ready = undefined;
    throw error;
  });
  await ready;
  return c;
}
