// @vitest-environment node
//
// Linking photos/videos to timeline steps (media.step_id).
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
const { addStep, deleteStep, reorderSteps, setMediaStep, restoreMedia } =
  await import("@/app/baking/actions");

/** The step id each photo is linked to, as the log page sees it. */
const links = async (logId: string) =>
  Object.fromEntries((await getLog(logId))!.media.map((m) => [m.id, m.stepId]));

describe("photos linked to timeline steps", () => {
  let c: Client;

  beforeEach(async () => {
    c = await db();
    await resetTables(c);
    await insertLog(c, "log1");
    await insertMedia(c, "photo1", "log1");
    await insertMedia(c, "photo2", "log1");
  });

  afterAll(() => c.close());

  it("starts with photos unlinked", async () => {
    expect(await links("log1")).toEqual({ photo1: null, photo2: null });
  });

  it("links a photo to a step and unlinks it again", async () => {
    const step = await addStep("log1", null, { text: "shape" });
    await setMediaStep("photo1", step.id);
    expect(await links("log1")).toEqual({ photo1: step.id, photo2: null });

    await setMediaStep("photo1", null);
    expect(await links("log1")).toEqual({ photo1: null, photo2: null });
  });

  it("lets a step have several photos", async () => {
    const step = await addStep("log1", null, { text: "bake" });
    await setMediaStep("photo1", step.id);
    await setMediaStep("photo2", step.id);
    expect(await links("log1")).toEqual({ photo1: step.id, photo2: step.id });
  });

  it("moves a photo when it's linked to a different step", async () => {
    const first = await addStep("log1", null, { text: "mix" });
    const second = await addStep("log1", null, { text: "bake" });
    await setMediaStep("photo1", first.id);
    await setMediaStep("photo1", second.id);
    expect((await links("log1")).photo1).toBe(second.id);
  });

  it("refuses a step from another log, leaving the photo unchanged", async () => {
    await insertLog(c, "log2");
    const mine = await addStep("log1", null, { text: "mine" });
    const theirs = await addStep("log2", null, { text: "theirs" });
    await setMediaStep("photo1", mine.id);

    await expect(setMediaStep("photo1", theirs.id)).rejects.toThrow();
    expect((await links("log1")).photo1).toBe(mine.id);
  });

  it("keeps the link when steps are reordered", async () => {
    const a = await addStep("log1", null, { text: "a" });
    const b = await addStep("log1", null, { text: "b" });
    const d = await addStep("log1", null, { text: "c" });
    await setMediaStep("photo1", b.id);

    await reorderSteps("log1", [d.id, b.id, a.id]);
    await addStep("log1", d.id, { text: "inserted" });

    const log = (await getLog("log1"))!;
    expect(log.timeline.map((s) => s.text)).toEqual([
      "c",
      "inserted",
      "b",
      "a",
    ]);
    expect(log.media.find((m) => m.id === "photo1")!.stepId).toBe(b.id);
  });

  it("keeps a deleted step's photos in the log, unlinked", async () => {
    const step = await addStep("log1", null, { text: "bake" });
    await setMediaStep("photo1", step.id);
    await deleteStep(step.id);

    const log = (await getLog("log1"))!;
    expect(log.media.map((m) => m.id)).toEqual(["photo1", "photo2"]);
    expect(log.media.find((m) => m.id === "photo1")!.stepId).toBeNull();
  });

  it("hides a deleted photo from its step, and restoring brings the link back", async () => {
    const step = await addStep("log1", null, { text: "bake" });
    await setMediaStep("photo1", step.id);
    await c.execute({
      sql: "UPDATE media SET deleted_at = ? WHERE id = 'photo1'",
      args: [Date.now() - DAY],
    });
    expect(Object.keys(await links("log1"))).toEqual(["photo2"]);

    await restoreMedia("photo1");
    expect((await links("log1")).photo1).toBe(step.id);
  });
});
