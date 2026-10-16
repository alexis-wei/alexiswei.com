"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import {
  endEditorSession,
  passcodeMatches,
  requireEditor,
  startEditorSession,
} from "@/lib/baking/auth";
import { db } from "@/lib/baking/db";
import { deleteObjects, publicUrl } from "@/lib/baking/storage";
import type { Ingredient, LogPatch, Media } from "@/lib/baking/types";

const torontoToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(
    new Date(),
  );

// Keys must be ones the upload route could have issued.
const validKey = (key: string, prefix: string) =>
  key.startsWith(prefix) && !key.includes("..");

export async function unlock(_: string | null, form: FormData) {
  if (!passcodeMatches(String(form.get("passcode") ?? ""))) {
    // Slow down guessing.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return "That passcode isn't right.";
  }
  await startEditorSession();
  redirect("/baking");
}

export async function lock() {
  await endEditorSession();
  redirect("/baking");
}

export async function createLog() {
  await requireEditor();
  const id = randomUUID();
  const now = Date.now();
  await (
    await db()
  ).execute({
    sql: "INSERT INTO logs (id, baked_on, created_at, updated_at) VALUES (?, ?, ?, ?)",
    args: [id, torontoToday(), now, now],
  });
  redirect(`/baking/${id}`);
}

const COLUMNS = {
  title: "title",
  bakedOn: "baked_on",
  process: "process",
  notes: "notes",
  timeline: "timeline",
} as const;

export async function updateLog(id: string, patch: LogPatch) {
  await requireEditor();
  const sets: string[] = [];
  const args: (string | number)[] = [];
  for (const [field, column] of Object.entries(COLUMNS)) {
    const value = patch[field as keyof LogPatch];
    if (value === undefined) continue;
    sets.push(`${column} = ?`);
    args.push(typeof value === "string" ? value : JSON.stringify(value));
  }
  if (sets.length === 0) return;
  await (
    await db()
  ).execute({
    sql: `UPDATE logs SET ${sets.join(", ")}, updated_at = ? WHERE id = ?`,
    args: [...args, Date.now(), id],
  });
}

export async function deleteLog(id: string) {
  await requireEditor();
  const client = await db();
  const { rows } = await client.execute({
    sql: "SELECT key FROM media WHERE log_id = ?",
    args: [id],
  });
  await client.batch(
    [
      { sql: "DELETE FROM media WHERE log_id = ?", args: [id] },
      { sql: "DELETE FROM log_ingredients WHERE log_id = ?", args: [id] },
      { sql: "DELETE FROM logs WHERE id = ?", args: [id] },
    ],
    "write",
  );
  await deleteObjects(rows.map((r) => String(r.key)));
  redirect("/baking");
}

export async function setIngredientSelected(
  logId: string,
  ingredientId: string,
  selected: boolean,
) {
  await requireEditor();
  await (
    await db()
  ).execute(
    selected
      ? {
          sql: `INSERT OR IGNORE INTO log_ingredients (log_id, ingredient_id, position)
                VALUES (?, ?, (SELECT COALESCE(MAX(position), -1) + 1 FROM log_ingredients WHERE log_id = ?))`,
          args: [logId, ingredientId, logId],
        }
      : {
          sql: "DELETE FROM log_ingredients WHERE log_id = ? AND ingredient_id = ?",
          args: [logId, ingredientId],
        },
  );
}

export async function setIngredientAmount(
  logId: string,
  ingredientId: string,
  amount: string,
) {
  await requireEditor();
  await (
    await db()
  ).execute({
    sql: "UPDATE log_ingredients SET amount = ? WHERE log_id = ? AND ingredient_id = ?",
    args: [amount, logId, ingredientId],
  });
}

export async function createIngredient(
  name: string,
  imageKey: string | null,
): Promise<Ingredient> {
  await requireEditor();
  if (imageKey && !validKey(imageKey, "baking/ingredients/")) {
    throw new Error("Invalid image");
  }
  const id = randomUUID();
  const trimmed = name.trim() || "untitled";
  await (
    await db()
  ).execute({
    sql: "INSERT INTO ingredients (id, name, image_key, created_at) VALUES (?, ?, ?, ?)",
    args: [id, trimmed, imageKey, Date.now()],
  });
  return { id, name: trimmed, imageUrl: imageKey ? publicUrl(imageKey) : null };
}

export async function addMedia(
  logId: string,
  item: {
    key: string;
    kind: Media["kind"];
    width: number | null;
    height: number | null;
  },
): Promise<Media> {
  await requireEditor();
  if (!validKey(item.key, `baking/media/${logId}/`)) {
    throw new Error("Invalid upload");
  }
  const id = randomUUID();
  await (
    await db()
  ).execute({
    sql: `INSERT INTO media (id, log_id, key, kind, width, height, position, created_at)
          VALUES (?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(position), -1) + 1 FROM media WHERE log_id = ?), ?)`,
    args: [
      id,
      logId,
      item.key,
      item.kind,
      item.width,
      item.height,
      logId,
      Date.now(),
    ],
  });
  return {
    id,
    kind: item.kind,
    url: publicUrl(item.key),
    width: item.width,
    height: item.height,
  };
}

export async function deleteMedia(id: string) {
  await requireEditor();
  const client = await db();
  const { rows } = await client.execute({
    sql: "DELETE FROM media WHERE id = ? RETURNING key",
    args: [id],
  });
  await deleteObjects(rows.map((r) => String(r.key)));
}
