// @vitest-environment node
//
// The 30-day "recently deleted" purge.
// Runs the real database code against a throwaway in-memory SQLite database
// (never Turso or the local dev file). See ./harness.ts.

import type { Client } from "@libsql/client";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DAY, insertLog, insertMedia, resetTables } from "./harness";

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

const { db } = await import("@/lib/baking/db");
const { getLog } = await import("@/lib/baking/queries");
const { purgeExpired } = await import("@/lib/baking/trash");
const { addStep } = await import("@/app/baking/actions");

describe("purging after 30 days", () => {
  let c: Client;

  beforeEach(async () => {
    c = await db();
    await resetTables(c);
    await insertLog(c, "log1");
  });

  afterAll(() => c.close());

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

  it("keeps recently deleted photos, and hides them from the log", async () => {
    await insertMedia(c, "kept", "log1");
    await insertMedia(c, "recent", "log1", Date.now() - 2 * DAY);
    await insertMedia(c, "expired", "log1", Date.now() - 31 * DAY);

    await purgeExpired();

    const { rows } = await c.execute("SELECT id FROM media ORDER BY id");
    expect(rows.map((r) => r.id)).toEqual(["kept", "recent"]);
    expect((await getLog("log1"))!.media.map((m) => m.id)).toEqual(["kept"]);
  });
});
