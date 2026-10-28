// @vitest-environment node
//
// Schema and data migrations, run against a database shaped like production
// before each release.
// Runs the real database code against a throwaway in-memory SQLite database
// (never Turso or the local dev file). See ./harness.ts.

import { createClient, type Client } from "@libsql/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.TURSO_DATABASE_URL = ":memory:";
  delete process.env.R2_ACCOUNT_ID; // keep file deletion a no-op
});

vi.mock("@/lib/baking/auth", () => ({
  requireEditor: async () => {},
  isEditor: async () => true,
}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/server", () => ({ after: vi.fn() }));

const { migrate } = await import("@/lib/baking/db");

describe("migrating an existing database", () => {
  let c: Client;

  beforeEach(async () => {
    c = createClient({ url: ":memory:" });
    // The shape a production database had before this release.
    await c.batch(
      [
        `CREATE TABLE logs (
          id TEXT PRIMARY KEY, title TEXT NOT NULL DEFAULT '',
          baked_on TEXT NOT NULL, process TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '', timeline TEXT NOT NULL DEFAULT '[]',
          created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
          room_temp TEXT NOT NULL DEFAULT '', humidity TEXT NOT NULL DEFAULT '')`,
        {
          sql: "INSERT INTO logs (id, title, baked_on, timeline, created_at, updated_at, room_temp) VALUES (?, ?, ?, ?, 1, 5, '22°C')",
          args: [
            "cookies",
            "miso cookies",
            "2026-10-15",
            JSON.stringify([
              {
                id: "a",
                time: "09:00",
                text: "brown the butter",
                humidity: "48%",
              },
              {
                id: "b",
                time: "09:30",
                text: "chill",
                roomTemp: "23°C",
                internalTemp: "4°C",
              },
            ]),
          ],
        },
        "INSERT INTO logs (id, baked_on, timeline, created_at, updated_at) VALUES ('broken', '2026-10-15', 'not json', 1, 1)",
        "INSERT INTO logs (id, baked_on, created_at, updated_at) VALUES ('empty', '2026-10-15', 1, 1)",
      ],
      "write",
    );
  });

  it("copies JSON steps into timeline_steps, in order, with every reading", async () => {
    await migrate(c);
    const { rows } = await c.execute(
      "SELECT * FROM timeline_steps WHERE log_id = 'cookies' ORDER BY position",
    );
    expect(rows.map((r) => ({ ...r }))).toMatchObject([
      {
        position: 0,
        time: "09:00",
        text: "brown the butter",
        humidity: "48%",
        room_temp: "",
        internal_temp: "",
      },
      {
        position: 1,
        time: "09:30",
        text: "chill",
        room_temp: "23°C",
        internal_temp: "4°C",
      },
    ]);
  });

  it("keeps the old JSON and every other log field untouched", async () => {
    await migrate(c);
    const { rows } = await c.execute(
      "SELECT title, timeline FROM logs WHERE id = 'cookies'",
    );
    expect(rows[0].title).toBe("miso cookies");
    expect(JSON.parse(String(rows[0].timeline))).toHaveLength(2);
  });

  it("skips logs whose JSON is unreadable or empty", async () => {
    await migrate(c);
    const { rows } = await c.execute(
      "SELECT count(*) AS n FROM timeline_steps WHERE log_id IN ('broken', 'empty')",
    );
    expect(rows[0].n).toBe(0);
  });

  it("runs once: steps deleted later are not copied back on the next start", async () => {
    await migrate(c);
    await c.execute("DELETE FROM timeline_steps WHERE log_id = 'cookies'");
    await migrate(c); // simulates a server restart
    const { rows } = await c.execute(
      "SELECT count(*) AS n FROM timeline_steps",
    );
    expect(rows[0].n).toBe(0);
    const done = await c.execute("SELECT name FROM schema_migrations");
    expect(done.rows.map((r) => r.name).sort()).toEqual([
      "2026-10-recipe-library",
      "2026-10-timeline-steps",
    ]);
  });

  it("adds new columns and drops the removed starting-room ones", async () => {
    await migrate(c);
    const { rows } = await c.execute("PRAGMA table_info(logs)");
    const columns = rows.map((r) => r.name);
    expect(columns).toEqual(
      expect.arrayContaining([
        "start_time",
        "deleted_at",
        "cover_media_id",
        "recipe_url",
        "recipe_text",
      ]),
    );
    expect(columns).not.toContain("room_temp");
    expect(columns).not.toContain("humidity");
  });
});

describe("moving log recipes into the recipe library", () => {
  let c: Client;

  beforeEach(async () => {
    c = createClient({ url: ":memory:" });
    // The shape production had before the recipe library: each log held its
    // own recipe link, pasted text and files.
    await c.batch(
      [
        `CREATE TABLE logs (
          id TEXT PRIMARY KEY, title TEXT NOT NULL DEFAULT '',
          baked_on TEXT NOT NULL, process TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '', timeline TEXT NOT NULL DEFAULT '[]',
          created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
          deleted_at INTEGER,
          recipe_url TEXT NOT NULL DEFAULT '',
          recipe_text TEXT NOT NULL DEFAULT '')`,
        `CREATE TABLE recipe_files (
          id TEXT PRIMARY KEY, log_id TEXT NOT NULL, key TEXT NOT NULL,
          name TEXT NOT NULL DEFAULT '', content_type TEXT NOT NULL,
          size INTEGER, position INTEGER NOT NULL,
          created_at INTEGER NOT NULL, deleted_at INTEGER) STRICT`,
        `INSERT INTO logs (id, title, baked_on, created_at, updated_at, recipe_url, recipe_text)
         VALUES ('cookies', 'miso cookies', '2026-10-15', 1, 5,
                 'https://example.com/miso', '225g butter\n2 tbsp miso')`,
        `INSERT INTO logs (id, title, baked_on, created_at, updated_at)
         VALUES ('bread', 'country loaf', '2026-10-16', 2, 6)`,
        `INSERT INTO logs (id, baked_on, created_at, updated_at)
         VALUES ('nothing', '2026-10-17', 3, 7)`,
        `INSERT INTO recipe_files (id, log_id, key, content_type, position, created_at)
         VALUES ('scan', 'bread', 'baking/recipes/bread/scan.pdf', 'application/pdf', 0, 1)`,
      ],
      "write",
    );
    await migrate(c);
  });

  const recipes = async () =>
    (await c.execute("SELECT * FROM recipes ORDER BY id")).rows.map((r) => ({
      ...r,
    }));

  it("makes a recipe from each log that had a link, text or files", async () => {
    expect(await recipes()).toMatchObject([
      { id: "bread-recipe", name: "country loaf", url: "", text: "" },
      {
        id: "cookies-recipe",
        name: "miso cookies",
        url: "https://example.com/miso",
        text: "225g butter\n2 tbsp miso",
        deleted_at: null,
      },
    ]);
  });

  it("links each new recipe to its log, and moves the files onto it", async () => {
    const links = await c.execute(
      "SELECT log_id, recipe_id FROM log_recipes ORDER BY log_id",
    );
    expect(links.rows.map((r) => [r.log_id, r.recipe_id])).toEqual([
      ["bread", "bread-recipe"],
      ["cookies", "cookies-recipe"],
    ]);
    const files = await c.execute("SELECT recipe_id, key FROM recipe_files");
    expect(files.rows[0].recipe_id).toBe("bread-recipe");
    expect(files.rows[0].key).toBe("baking/recipes/bread/scan.pdf");
  });

  it("leaves the old log columns in place as a backup", async () => {
    const { rows } = await c.execute(
      "SELECT recipe_url, recipe_text FROM logs WHERE id = 'cookies'",
    );
    expect(rows[0].recipe_url).toBe("https://example.com/miso");
    expect(rows[0].recipe_text).toBe("225g butter\n2 tbsp miso");
  });

  it("runs once: a recipe deleted later isn't recreated on the next start", async () => {
    await c.execute("DELETE FROM recipes WHERE id = 'cookies-recipe'");
    await migrate(c);
    expect((await recipes()).map((r) => r.id)).toEqual(["bread-recipe"]);
  });
});
