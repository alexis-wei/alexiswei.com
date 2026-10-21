// @vitest-environment node
//
// Timeline steps: adding, inserting, reordering, updating and deleting.
// Runs the real database code against a throwaway in-memory SQLite database
// (never Turso or the local dev file). See ./harness.ts.

import type { Client } from "@libsql/client";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { insertLog, resetTables } from "./harness";

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
const { addStep, deleteStep, reorderSteps, updateStep } =
  await import("@/app/baking/actions");

const texts = async (logId: string) =>
  (await getLog(logId))?.timeline.map((s) => s.text);

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
});
