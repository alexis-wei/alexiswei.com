// Shared helpers for the database tests in this folder.
//
// Each test file sets TURSO_DATABASE_URL to ":memory:" and mocks the editor
// check and Next.js request APIs itself (vi.mock must live in the test file),
// then imports the real modules dynamically so they see that setup.

import type { Client } from "@libsql/client";

export const DAY = 24 * 60 * 60 * 1000;

export async function insertLog(
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

let mediaCount = 0;

/** Adds a photo row to a log (the file itself isn't needed for these tests). */
export async function insertMedia(
  c: Client,
  id: string,
  logId: string,
  deletedAt: number | null = null,
) {
  await c.execute({
    sql: `INSERT INTO media (id, log_id, key, kind, position, created_at, deleted_at)
          VALUES (?, ?, ?, 'image', ?, 1, ?)`,
    args: [
      id,
      logId,
      `baking/media/${logId}/${id}.webp`,
      mediaCount++,
      deletedAt,
    ],
  });
}

/** Clears every table between tests (the in-memory database lives per file). */
export async function resetTables(c: Client) {
  await c.batch(
    [
      "DELETE FROM timeline_steps",
      "DELETE FROM media",
      "DELETE FROM recipe_files",
      "DELETE FROM log_recipes",
      "DELETE FROM recipes",
      "DELETE FROM log_ingredients",
      "DELETE FROM logs",
    ],
    "write",
  );
}
