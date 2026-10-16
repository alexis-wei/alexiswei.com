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
import type {
  Ingredient,
  IngredientImage,
  IngredientPatch,
  LogPatch,
  Media,
} from "@/lib/baking/types";

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
  startTime: "start_time",
  endTime: "end_time",
  roomTemp: "room_temp",
  humidity: "humidity",
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

const INGREDIENT_IMAGES = "baking/ingredients/";

function checkImage(image: IngredientImage) {
  const keys = [image.imageKey, image.sourceKey].filter(Boolean) as string[];
  if (keys.some((key) => !validKey(key, INGREDIENT_IMAGES))) {
    throw new Error("Invalid image");
  }
}

export async function createIngredient(input: {
  name: string;
  origin: string;
  details: string;
  image: IngredientImage | null;
}): Promise<Ingredient> {
  await requireEditor();
  const { image } = input;
  if (image) checkImage(image);
  const ingredient: Ingredient = {
    id: randomUUID(),
    name: input.name.trim(),
    origin: input.origin.trim(),
    details: input.details.trim(),
    imageUrl: image ? publicUrl(image.imageKey) : null,
    sourceUrl: image?.sourceKey ? publicUrl(image.sourceKey) : null,
    crop: image?.crop ?? null,
  };
  await (
    await db()
  ).execute({
    sql: `INSERT INTO ingredients (id, name, origin, details, image_key, source_key, crop, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      ingredient.id,
      ingredient.name,
      ingredient.origin,
      ingredient.details,
      image?.imageKey ?? null,
      image?.sourceKey ?? null,
      image ? JSON.stringify(image.crop) : "",
      Date.now(),
    ],
  });
  return ingredient;
}

/** "New ingredient" on the ingredients page: start blank, fill in on its page. */
export async function createBlankIngredient() {
  const { id } = await createIngredient({
    name: "",
    origin: "",
    details: "",
    image: null,
  });
  redirect(`/baking/ingredients/${id}`);
}

const INGREDIENT_COLUMNS = {
  name: "name",
  origin: "origin",
  details: "details",
} as const;

export async function updateIngredient(id: string, patch: IngredientPatch) {
  await requireEditor();
  const fields = Object.entries(INGREDIENT_COLUMNS).filter(
    ([field]) => patch[field as keyof IngredientPatch] !== undefined,
  );
  if (fields.length === 0) return;
  await (
    await db()
  ).execute({
    sql: `UPDATE ingredients SET ${fields.map(([, column]) => `${column} = ?`).join(", ")} WHERE id = ?`,
    args: [
      ...fields.map(([field]) => patch[field as keyof IngredientPatch]!),
      id,
    ],
  });
}

/**
 * Saves a new icon. With a sourceKey it's a new picture (the old icon and
 * original are deleted); without one it's a re-crop of the same original.
 */
export async function setIngredientImage(
  id: string,
  image: IngredientImage,
): Promise<Pick<Ingredient, "imageUrl" | "sourceUrl" | "crop">> {
  await requireEditor();
  checkImage(image);
  const client = await db();
  const { rows } = await client.execute({
    sql: "SELECT image_key, source_key FROM ingredients WHERE id = ?",
    args: [id],
  });
  const old = rows[0];
  if (!old) throw new Error("Ingredient not found");
  const sourceKey = image.sourceKey ?? (old.source_key as string | null);
  await client.execute({
    sql: "UPDATE ingredients SET image_key = ?, source_key = ?, crop = ? WHERE id = ?",
    args: [image.imageKey, sourceKey, JSON.stringify(image.crop), id],
  });
  const stale = [old.image_key, image.sourceKey ? old.source_key : null];
  await deleteObjects(stale.filter(Boolean).map(String));
  return {
    imageUrl: publicUrl(image.imageKey),
    sourceUrl: sourceKey ? publicUrl(sourceKey) : null,
    crop: image.crop,
  };
}

export async function deleteIngredient(id: string) {
  await requireEditor();
  const client = await db();
  const { rows } = await client.execute({
    sql: "SELECT image_key, source_key FROM ingredients WHERE id = ?",
    args: [id],
  });
  await client.batch(
    [
      {
        sql: "DELETE FROM log_ingredients WHERE ingredient_id = ?",
        args: [id],
      },
      { sql: "DELETE FROM ingredients WHERE id = ?", args: [id] },
    ],
    "write",
  );
  const keys = [rows[0]?.image_key, rows[0]?.source_key];
  await deleteObjects(keys.filter(Boolean).map(String));
  redirect("/baking/ingredients");
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
