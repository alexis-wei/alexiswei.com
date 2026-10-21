// @vitest-environment node
//
// Runs the real database code against a throwaway in-memory SQLite database
// (never Turso or the local dev file), so migrations and step ordering are
// tested exactly as they run in production.

import { createClient, type Client } from "@libsql/client";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

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

const { db, migrate } = await import("./db");
const { getLog } = await import("./queries");
const { purgeExpired } = await import("./trash");
const { addStep, deleteStep, reorderSteps, updateStep } =
  await import("@/app/baking/actions");

const DAY = 24 * 60 * 60 * 1000;

async function insertLog(
  c: Client,
  id: string,
  deletedAt: number | null = null,
) {
  await c.execute({
    sql: `INSERT INTO logs (id, title, baked_on, created_at, updated_at, deleted_at)
          VALUES (?, ?, '2026-10-15', 1, 1, ?)`,
    args: [id, `log ${id}`, deletedAt],
  });
}

const texts = async (logId: string) =>
  (await getLog(logId))?.timeline.map((s) => s.text);

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

describe("timeline steps", () => {
  let c: Client;

  beforeEach(async () => {
    c = await db();
    await c.batch(
      [
        "DELETE FROM timeline_steps",
        "DELETE FROM logs",
        "DELETE FROM recipe_files",
      ],
      "write",
    );
    await insertLog(c, "log1");
  });

  afterAll(() => c.close());

  it("appends steps, and inserts a forgotten one in the right place", async () => {
    const mix = await addStep("log1", null, { text: "mix", time: "09:00" });
    await addStep("log1", null, { text: "bake" });
    await addStep("log1", mix.id, { text: "rest" });
    expect(await texts("log1")).toEqual(["mix", "rest", "bake"]);
  });

  it("inserts after the last step", async () => {
    await addStep("log1", null, { text: "mix" });
    const bake = await addStep("log1", null, { text: "bake" });
    await addStep("log1", bake.id, { text: "cool" });
    expect(await texts("log1")).toEqual(["mix", "bake", "cool"]);
  });

  it("appends when the step to insert after no longer exists", async () => {
    await addStep("log1", null, { text: "mix" });
    await addStep("log1", "deleted-step", { text: "bake" });
    expect(await texts("log1")).toEqual(["mix", "bake"]);
  });

  it("saves a new order", async () => {
    const a = await addStep("log1", null, { text: "a" });
    const b = await addStep("log1", null, { text: "b" });
    const d = await addStep("log1", null, { text: "c" });
    await reorderSteps("log1", [d.id, a.id, b.id]);
    expect(await texts("log1")).toEqual(["c", "a", "b"]);
  });

  it("only reorders steps that belong to the log", async () => {
    await insertLog(c, "log2");
    const other = await addStep("log2", null, { text: "other log" });
    const mine = await addStep("log1", null, { text: "mine" });
    await reorderSteps("log1", [other.id, mine.id]);
    expect(await texts("log2")).toEqual(["other log"]);
    expect(await texts("log1")).toEqual(["mine"]);
  });

  it("keeps order after a delete, and inserts correctly into the gap", async () => {
    const a = await addStep("log1", null, { text: "a" });
    const b = await addStep("log1", null, { text: "b" });
    await addStep("log1", null, { text: "c" });
    await deleteStep(b.id);
    await addStep("log1", a.id, { text: "a2" });
    expect(await texts("log1")).toEqual(["a", "a2", "c"]);
  });

  it("updates one field without touching the others", async () => {
    const step = await addStep("log1", null, { text: "proof", time: "10:00" });
    await updateStep(step.id, { humidity: "52%" });
    const [saved] = (await getLog("log1"))!.timeline;
    expect(saved).toMatchObject({
      text: "proof",
      time: "10:00",
      humidity: "52%",
      roomTemp: "",
    });
  });

  it("purges a log's steps along with it after 30 days", async () => {
    await insertLog(c, "old", Date.now() - 31 * DAY);
    await insertLog(c, "recent", Date.now() - 2 * DAY);
    await addStep("old", null, { text: "gone" });
    await addStep("recent", null, { text: "kept" });
    await addStep("log1", null, { text: "kept too" });

    await purgeExpired();

    const { rows } = await c.execute(
      "SELECT log_id FROM timeline_steps ORDER BY log_id",
    );
    expect(rows.map((r) => r.log_id)).toEqual(["log1", "recent"]);
    const logs = await c.execute("SELECT id FROM logs ORDER BY id");
    expect(logs.rows.map((r) => r.id)).toEqual(["log1", "recent"]);
  });
});
