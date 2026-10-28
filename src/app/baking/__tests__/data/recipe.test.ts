// @vitest-environment node
//
// A log's pasted recipe (logs.recipe_text).
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
const { updateLog } = await import("@/app/baking/actions");

const RECIPE = `brown butter miso cookies

225g butter, browned
2 tbsp white miso
  – whisk until glossy

bake 11 min at 180°C`;

describe("pasted recipe", () => {
  let c: Client;

  beforeEach(async () => {
    c = await db();
    await resetTables(c);
    await insertLog(c, "log1");
  });

  afterAll(() => c.close());

  it("is empty on existing logs", async () => {
    expect((await getLog("log1"))!.recipeText).toBe("");
  });

  it("is saved exactly as pasted: line breaks, spacing and symbols", async () => {
    await updateLog("log1", { recipeText: RECIPE });
    expect((await getLog("log1"))!.recipeText).toBe(RECIPE);
  });

  it("doesn't touch the recipe link or other fields", async () => {
    await updateLog("log1", { recipeUrl: "https://example.com/cookies" });
    await updateLog("log1", { recipeText: RECIPE });
    const log = (await getLog("log1"))!;
    expect(log.recipeUrl).toBe("https://example.com/cookies");
    expect(log.title).toBe("log log1");
  });
});
