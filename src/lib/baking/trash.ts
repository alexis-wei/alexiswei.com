import { db } from "./db";
import { deleteObjects, publicUrl } from "./storage";

// Deleting a log, ingredient, recipe, photo, video or recipe file only marks it (deleted_at) and
// hides it everywhere. It can be restored from "recently deleted" for 30
// days; after that, purgeExpired() removes the rows and their files in R2.

export const RETENTION_DAYS = 30;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

export type DeletedItem = {
  id: string;
  kind: "log" | "ingredient" | "recipe" | "media" | "recipeFile";
  label: string;
  detail: string;
  thumbUrl: string | null;
  mediaKind?: "image" | "video";
  deletedAt: number;
  daysLeft: number;
};

const daysLeft = (deletedAt: number) =>
  Math.max(
    0,
    Math.ceil((deletedAt + RETENTION_MS - Date.now()) / (24 * 60 * 60 * 1000)),
  );

export async function listDeleted(): Promise<DeletedItem[]> {
  const [logs, ingredients, recipes, media, files] = await (
    await db()
  ).batch(
    [
      `SELECT l.id, l.title, l.baked_on, l.deleted_at,
         (SELECT key FROM media WHERE log_id = l.id AND kind = 'image'
          ORDER BY position LIMIT 1) AS cover_key
       FROM logs l WHERE l.deleted_at IS NOT NULL`,
      "SELECT id, name, origin, image_key, deleted_at FROM ingredients WHERE deleted_at IS NOT NULL",
      `SELECT r.id, r.name, r.url, r.deleted_at,
         (SELECT key FROM recipe_files WHERE recipe_id = r.id
            AND deleted_at IS NULL AND content_type LIKE 'image/%'
          ORDER BY position LIMIT 1) AS thumb_key
       FROM recipes r WHERE r.deleted_at IS NOT NULL`,
      // Media from deleted logs comes back with its log, so only list the rest.
      `SELECT m.id, m.key, m.kind, m.deleted_at, l.title FROM media m
       JOIN logs l ON l.id = m.log_id
       WHERE m.deleted_at IS NOT NULL AND l.deleted_at IS NULL`,
      // Files from deleted recipes come back with their recipe.
      `SELECT f.id, f.key, f.name, f.content_type, f.deleted_at, r.name AS recipe
       FROM recipe_files f JOIN recipes r ON r.id = f.recipe_id
       WHERE f.deleted_at IS NOT NULL AND r.deleted_at IS NULL`,
    ],
    "read",
  );
  const items: DeletedItem[] = [
    ...logs.rows.map((r) => ({
      id: String(r.id),
      kind: "log" as const,
      label: String(r.title || "untitled"),
      detail: String(r.baked_on),
      thumbUrl: r.cover_key ? publicUrl(String(r.cover_key)) : null,
      deletedAt: Number(r.deleted_at),
      daysLeft: daysLeft(Number(r.deleted_at)),
    })),
    ...ingredients.rows.map((r) => ({
      id: String(r.id),
      kind: "ingredient" as const,
      label: String(r.name || "untitled"),
      detail: String(r.origin ?? ""),
      thumbUrl: r.image_key ? publicUrl(String(r.image_key)) : null,
      deletedAt: Number(r.deleted_at),
      daysLeft: daysLeft(Number(r.deleted_at)),
    })),
    ...recipes.rows.map((r) => ({
      id: String(r.id),
      kind: "recipe" as const,
      label: String(r.name || "untitled"),
      detail: String(r.url ?? ""),
      thumbUrl: r.thumb_key ? publicUrl(String(r.thumb_key)) : null,
      deletedAt: Number(r.deleted_at),
      daysLeft: daysLeft(Number(r.deleted_at)),
    })),
    ...media.rows.map((r) => ({
      id: String(r.id),
      kind: "media" as const,
      label: r.kind === "video" ? "video" : "photo",
      detail: `from ${r.title || "untitled"}`,
      thumbUrl: publicUrl(String(r.key)),
      mediaKind: (r.kind === "video" ? "video" : "image") as "image" | "video",
      deletedAt: Number(r.deleted_at),
      daysLeft: daysLeft(Number(r.deleted_at)),
    })),
    ...files.rows.map((r) => ({
      id: String(r.id),
      kind: "recipeFile" as const,
      label: String(r.name || "recipe file"),
      detail: `from ${r.recipe || "untitled"}`,
      thumbUrl: String(r.content_type).startsWith("image/")
        ? publicUrl(String(r.key))
        : null,
      deletedAt: Number(r.deleted_at),
      daysLeft: daysLeft(Number(r.deleted_at)),
    })),
  ];
  return items.sort((a, b) => b.deletedAt - a.deletedAt);
}

/** Permanently removes everything deleted more than 30 days ago. */
export async function purgeExpired(now = Date.now()) {
  const cutoff = now - RETENTION_MS;
  const client = await db();
  // Recipe files go with their recipe. Files from before the recipe library
  // that never got a recipe still go with their log.
  const expiredFiles = `deleted_at < ?
    OR recipe_id IN (SELECT id FROM recipes WHERE deleted_at < ?)
    OR (recipe_id IS NULL AND log_id IN (SELECT id FROM logs WHERE deleted_at < ?))`;
  const [logs, ingredients, recipes, media, files] = await client.batch(
    [
      { sql: "SELECT id FROM logs WHERE deleted_at < ?", args: [cutoff] },
      {
        sql: "SELECT id, image_key, source_key FROM ingredients WHERE deleted_at < ?",
        args: [cutoff],
      },
      { sql: "SELECT id FROM recipes WHERE deleted_at < ?", args: [cutoff] },
      {
        sql: `SELECT key FROM media WHERE deleted_at < ?
              OR log_id IN (SELECT id FROM logs WHERE deleted_at < ?)`,
        args: [cutoff, cutoff],
      },
      {
        sql: `SELECT key FROM recipe_files WHERE ${expiredFiles}`,
        args: [cutoff, cutoff, cutoff],
      },
    ],
    "read",
  );
  if (
    !logs.rows.length &&
    !ingredients.rows.length &&
    !recipes.rows.length &&
    !media.rows.length &&
    !files.rows.length
  ) {
    return;
  }

  await client.batch(
    [
      {
        sql: `DELETE FROM media WHERE deleted_at < ?
              OR log_id IN (SELECT id FROM logs WHERE deleted_at < ?)`,
        args: [cutoff, cutoff],
      },
      {
        sql: "DELETE FROM timeline_steps WHERE log_id IN (SELECT id FROM logs WHERE deleted_at < ?)",
        args: [cutoff],
      },
      {
        sql: `DELETE FROM recipe_files WHERE ${expiredFiles}`,
        args: [cutoff, cutoff, cutoff],
      },
      {
        sql: `DELETE FROM log_recipes
              WHERE log_id IN (SELECT id FROM logs WHERE deleted_at < ?)
              OR recipe_id IN (SELECT id FROM recipes WHERE deleted_at < ?)`,
        args: [cutoff, cutoff],
      },
      {
        sql: `DELETE FROM log_ingredients
              WHERE log_id IN (SELECT id FROM logs WHERE deleted_at < ?)
              OR ingredient_id IN (SELECT id FROM ingredients WHERE deleted_at < ?)`,
        args: [cutoff, cutoff],
      },
      { sql: "DELETE FROM logs WHERE deleted_at < ?", args: [cutoff] },
      { sql: "DELETE FROM ingredients WHERE deleted_at < ?", args: [cutoff] },
      { sql: "DELETE FROM recipes WHERE deleted_at < ?", args: [cutoff] },
    ],
    "write",
  );

  const keys = [
    ...media.rows.map((r) => r.key),
    ...files.rows.map((r) => r.key),
    ...ingredients.rows.flatMap((r) => [r.image_key, r.source_key]),
  ];
  await deleteObjects(keys.filter(Boolean).map(String));
}
