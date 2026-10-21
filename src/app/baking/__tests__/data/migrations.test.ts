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
    expect(done.rows.map((r) => r.name)).toEqual(["2026-10-timeline-steps"]);
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
      ]),
    );
    expect(columns).not.toContain("room_temp");
    expect(columns).not.toContain("humidity");
  });
});
