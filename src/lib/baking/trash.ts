import { db } from "./db";
import { deleteObjects, publicUrl } from "./storage";

// Deleting a log, ingredient, photo or video only marks it (deleted_at) and
// hides it everywhere. It can be restored from "recently deleted" for 30
// days; after that, purgeExpired() removes the rows and their files in R2.

export const RETENTION_DAYS = 30;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

export type DeletedItem = {
  id: string;
  kind: "log" | "ingredient" | "media";
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
  const [logs, ingredients, media] = await (
    await db()
  ).batch(
    [
      `SELECT l.id, l.title, l.baked_on, l.deleted_at,
         (SELECT key FROM media WHERE log_id = l.id AND kind = 'image'
          ORDER BY position LIMIT 1) AS cover_key
       FROM logs l WHERE l.deleted_at IS NOT NULL`,
      "SELECT id, name, origin, image_key, deleted_at FROM ingredients WHERE deleted_at IS NOT NULL",
      // Media from deleted logs comes back with its log, so only list the rest.
      `SELECT m.id, m.key, m.kind, m.deleted_at, l.title FROM media m
       JOIN logs l ON l.id = m.log_id
       WHERE m.deleted_at IS NOT NULL AND l.deleted_at IS NULL`,
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
  ];
  return items.sort((a, b) => b.deletedAt - a.deletedAt);
}

/** Permanently removes everything deleted more than 30 days ago. */
export async function purgeExpired(now = Date.now()) {
  const cutoff = now - RETENTION_MS;
  const client = await db();
  const [logs, ingredients, media] = await client.batch(
    [
      { sql: "SELECT id FROM logs WHERE deleted_at < ?", args: [cutoff] },
      {
        sql: "SELECT id, image_key, source_key FROM ingredients WHERE deleted_at < ?",
        args: [cutoff],
      },
      {
        sql: `SELECT key FROM media WHERE deleted_at < ?
              OR log_id IN (SELECT id FROM logs WHERE deleted_at < ?)`,
        args: [cutoff, cutoff],
      },
    ],
    "read",
  );
  if (!logs.rows.length && !ingredients.rows.length && !media.rows.length) {
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
        sql: `DELETE FROM log_ingredients
              WHERE log_id IN (SELECT id FROM logs WHERE deleted_at < ?)
              OR ingredient_id IN (SELECT id FROM ingredients WHERE deleted_at < ?)`,
        args: [cutoff, cutoff],
      },
      { sql: "DELETE FROM logs WHERE deleted_at < ?", args: [cutoff] },
      { sql: "DELETE FROM ingredients WHERE deleted_at < ?", args: [cutoff] },
    ],
    "write",
  );

  const keys = [
    ...media.rows.map((r) => r.key),
    ...ingredients.rows.flatMap((r) => [r.image_key, r.source_key]),
  ];
  await deleteObjects(keys.filter(Boolean).map(String));
}
