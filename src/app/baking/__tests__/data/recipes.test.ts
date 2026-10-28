// @vitest-environment node
//
// The recipe library: recipes, their files, which logs use them, and
// deleting/restoring/purging them.
// Runs the real database code against a throwaway in-memory SQLite database
// (never Turso or the local dev file). See ./harness.ts.

import type { Client } from "@libsql/client";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DAY, insertLog, resetTables } from "./harness";

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
const { getLog, getRecipe, listRecipes } = await import("@/lib/baking/queries");
const { listDeleted, purgeExpired } = await import("@/lib/baking/trash");
const {
  addRecipeFile,
  createRecipe,
  deleteLog,
  deleteRecipe,
  deleteRecipeFile,
  restoreRecipe,
  setRecipeSelected,
  updateRecipe,
} = await import("@/app/baking/actions");

const PASTED = `brown butter miso cookies

225g butter, browned
  – whisk until glossy
bake 11 min at 180°C`;

const file = (recipeId: string, name = "scan.pdf") => ({
  key: `baking/recipes/${recipeId}/${name}`,
  name,
  contentType: "application/pdf",
  size: 1000,
});

// The in-memory database is shared by every test in this file.
afterAll(async () => (await db()).close());

const recipeIdsOf = async (logId: string) => (await getLog(logId))!.recipeIds;

describe("recipe library", () => {
  let c: Client;

  beforeEach(async () => {
    c = await db();
    await resetTables(c);
    await insertLog(c, "log1");
    await insertLog(c, "log2");
  });

  it("saves a recipe from a link and pasted text, exactly as written", async () => {
    const recipe = await createRecipe({
      name: "  miso cookies ",
      url: " https://example.com/miso ",
      text: PASTED,
    });
    const [saved] = await listRecipes();
    expect(saved).toEqual({
      id: recipe.id,
      name: "miso cookies",
      url: "https://example.com/miso",
      text: PASTED,
      files: [],
    });
  });

  it("updates one field without touching the others", async () => {
    const recipe = await createRecipe({ name: "loaf", url: "", text: PASTED });
    await updateRecipe(recipe.id, { url: "https://example.com/loaf" });
    expect((await getRecipe(recipe.id))!.recipe).toMatchObject({
      name: "loaf",
      url: "https://example.com/loaf",
      text: PASTED,
    });
  });

  it("keeps a recipe's files in order, and only accepts its own uploads", async () => {
    const recipe = await createRecipe({ name: "loaf", url: "", text: "" });
    await addRecipeFile(recipe.id, file(recipe.id, "page1.pdf"));
    await addRecipeFile(recipe.id, file(recipe.id, "page2.pdf"));
    await expect(
      addRecipeFile(recipe.id, file("someone-else")),
    ).rejects.toThrow();
    const { recipe: found } = (await getRecipe(recipe.id))!;
    expect(found.files.map((f) => f.name)).toEqual(["page1.pdf", "page2.pdf"]);
  });

  it("lists recipes by name", async () => {
    await createRecipe({ name: "scones", url: "", text: "" });
    await createRecipe({ name: "Bagels", url: "", text: "" });
    await createRecipe({ name: "loaf", url: "", text: "" });
    expect((await listRecipes()).map((r) => r.name)).toEqual([
      "Bagels",
      "loaf",
      "scones",
    ]);
  });
});

describe("logs using recipes", () => {
  let c: Client;

  beforeEach(async () => {
    c = await db();
    await resetTables(c);
    await insertLog(c, "log1");
    await insertLog(c, "log2");
  });

  it("lets a log pick several recipes, in the order picked", async () => {
    const dough = await createRecipe({ name: "dough", url: "", text: "" });
    const filling = await createRecipe({ name: "filling", url: "", text: "" });
    await setRecipeSelected("log1", filling.id, true);
    await setRecipeSelected("log1", dough.id, true);
    await setRecipeSelected("log1", dough.id, true); // picking twice is fine
    expect(await recipeIdsOf("log1")).toEqual([filling.id, dough.id]);

    await setRecipeSelected("log1", filling.id, false);
    expect(await recipeIdsOf("log1")).toEqual([dough.id]);
  });

  it("shares one recipe between logs, and lists where it's used", async () => {
    const recipe = await createRecipe({ name: "loaf", url: "", text: "" });
    await setRecipeSelected("log1", recipe.id, true);
    await setRecipeSelected("log2", recipe.id, true);
    expect(await recipeIdsOf("log2")).toEqual([recipe.id]);

    await deleteLog("log2");
    const { usage } = (await getRecipe(recipe.id))!;
    expect(usage.map((u) => u.logId)).toEqual(["log1"]);
  });
});

describe("deleting recipes", () => {
  let c: Client;

  beforeEach(async () => {
    c = await db();
    await resetTables(c);
    await insertLog(c, "log1");
  });

  it("hides a deleted recipe from the library and its logs, and restores it", async () => {
    const recipe = await createRecipe({ name: "loaf", url: "", text: "" });
    await setRecipeSelected("log1", recipe.id, true);
    await deleteRecipe(recipe.id);
    expect(await listRecipes()).toEqual([]);
    expect(await recipeIdsOf("log1")).toEqual([]);
    expect(await getRecipe(recipe.id)).toBeNull();
    expect((await listDeleted()).map((d) => [d.kind, d.label])).toEqual([
      ["recipe", "loaf"],
    ]);

    await restoreRecipe(recipe.id);
    expect(await recipeIdsOf("log1")).toEqual([recipe.id]);
  });

  it("lists a deleted file under its recipe", async () => {
    const recipe = await createRecipe({ name: "loaf", url: "", text: "" });
    const saved = await addRecipeFile(recipe.id, file(recipe.id));
    await deleteRecipeFile(saved.id);
    expect((await listDeleted()).map((d) => [d.kind, d.detail])).toEqual([
      ["recipeFile", "from loaf"],
    ]);
  });

  it("purges a recipe after 30 days, with its files and log links", async () => {
    const old = await createRecipe({ name: "old", url: "", text: "" });
    const kept = await createRecipe({ name: "kept", url: "", text: "" });
    await addRecipeFile(old.id, file(old.id));
    await addRecipeFile(kept.id, file(kept.id));
    await setRecipeSelected("log1", old.id, true);
    await setRecipeSelected("log1", kept.id, true);
    await c.execute({
      sql: "UPDATE recipes SET deleted_at = ? WHERE id = ?",
      args: [Date.now() - 31 * DAY, old.id],
    });

    await purgeExpired();
    const count = async (sql: string) =>
      Number((await c.execute(sql)).rows[0].n);
    expect(await count("SELECT count(*) AS n FROM recipes")).toBe(1);
    expect(await count("SELECT count(*) AS n FROM recipe_files")).toBe(1);
    expect(await count("SELECT count(*) AS n FROM log_recipes")).toBe(1);
    expect(await recipeIdsOf("log1")).toEqual([kept.id]);
  });

  it("keeps a recipe's files when a log that used it is purged", async () => {
    const recipe = await createRecipe({ name: "loaf", url: "", text: "" });
    await setRecipeSelected("log1", recipe.id, true);
    await c.execute({
      sql: `INSERT INTO recipe_files (id, recipe_id, key, content_type, position, created_at)
            VALUES ('scan', ?, 'baking/recipes/log1/scan.pdf', 'application/pdf', 0, 1)`,
      args: [recipe.id],
    });
    await c.execute({
      sql: "UPDATE logs SET deleted_at = ? WHERE id = 'log1'",
      args: [Date.now() - 31 * DAY],
    });

    await purgeExpired();
    expect((await getRecipe(recipe.id))!.recipe.files.map((f) => f.id)).toEqual(
      ["scan"],
    );
  });
});
