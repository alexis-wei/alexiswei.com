import type { Row } from "@libsql/client";
import { db } from "./db";
import { publicUrl } from "./storage";
import type {
  BakingLog,
  Ingredient,
  IngredientUsage,
  LogSummary,
  Media,
  SavedCrop,
  TimelineStep,
} from "./types";

const str = (value: unknown) => (value == null ? "" : String(value));
const num = (value: unknown) => (value == null ? null : Number(value));

function parseCrop(value: unknown): SavedCrop | null {
  try {
    const crop = JSON.parse(str(value));
    return typeof crop?.width === "number" ? crop : null;
  } catch {
    return null;
  }
}

function toIngredient(row: Row): Ingredient {
  return {
    id: str(row.id),
    name: str(row.name),
    origin: str(row.origin),
    details: str(row.details),
    imageUrl: row.image_key ? publicUrl(str(row.image_key)) : null,
    sourceUrl: row.source_key ? publicUrl(str(row.source_key)) : null,
    crop: parseCrop(row.crop),
  };
}

function toMedia(row: Row): Media {
  return {
    id: str(row.id),
    kind: row.kind === "video" ? "video" : "image",
    url: publicUrl(str(row.key)),
    width: num(row.width),
    height: num(row.height),
  };
}

function parseTimeline(value: unknown): TimelineStep[] {
  try {
    const parsed = JSON.parse(str(value) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function listIngredients(): Promise<Ingredient[]> {
  const { rows } = await (
    await db()
  ).execute("SELECT * FROM ingredients ORDER BY name COLLATE NOCASE");
  return rows.map(toIngredient);
}

export async function listLogs(): Promise<LogSummary[]> {
  const [logs, covers, used] = await (
    await db()
  ).batch(
    [
      "SELECT id, title, baked_on, start_time, end_time FROM logs ORDER BY baked_on DESC, created_at DESC",
      // First photo of each log (falls back to a video when there's no photo).
      `SELECT * FROM media m WHERE m.id = (
         SELECT id FROM media WHERE log_id = m.log_id
         ORDER BY kind = 'video', position LIMIT 1)`,
      `SELECT li.log_id, i.* FROM log_ingredients li
         JOIN ingredients i ON i.id = li.ingredient_id
         ORDER BY li.position`,
    ],
    "read",
  );

  const coverByLog = new Map(covers.rows.map((r) => [str(r.log_id), r]));
  const ingredientsByLog = new Map<string, Ingredient[]>();
  for (const row of used.rows) {
    const list = ingredientsByLog.get(str(row.log_id)) ?? [];
    list.push(toIngredient(row));
    ingredientsByLog.set(str(row.log_id), list);
  }

  return logs.rows.map((row) => {
    const cover = coverByLog.get(str(row.id));
    return {
      id: str(row.id),
      title: str(row.title),
      bakedOn: str(row.baked_on),
      startTime: str(row.start_time),
      endTime: str(row.end_time),
      cover: cover ? toMedia(cover) : null,
      ingredients: ingredientsByLog.get(str(row.id)) ?? [],
    };
  });
}

export async function getLog(id: string): Promise<BakingLog | null> {
  const [logs, ingredients, media] = await (
    await db()
  ).batch(
    [
      { sql: "SELECT * FROM logs WHERE id = ?", args: [id] },
      {
        sql: "SELECT ingredient_id, amount FROM log_ingredients WHERE log_id = ? ORDER BY position",
        args: [id],
      },
      {
        sql: "SELECT * FROM media WHERE log_id = ? ORDER BY position",
        args: [id],
      },
    ],
    "read",
  );

  const row = logs.rows[0];
  if (!row) return null;
  return {
    id: str(row.id),
    title: str(row.title),
    bakedOn: str(row.baked_on),
    startTime: str(row.start_time),
    endTime: str(row.end_time),
    roomTemp: str(row.room_temp),
    humidity: str(row.humidity),
    process: str(row.process),
    notes: str(row.notes),
    timeline: parseTimeline(row.timeline),
    ingredients: ingredients.rows.map((r) => ({
      ingredientId: str(r.ingredient_id),
      amount: str(r.amount),
    })),
    media: media.rows.map(toMedia),
  };
}

export async function getIngredient(
  id: string,
): Promise<{ ingredient: Ingredient; usage: IngredientUsage[] } | null> {
  const [found, usage] = await (
    await db()
  ).batch(
    [
      { sql: "SELECT * FROM ingredients WHERE id = ?", args: [id] },
      {
        sql: `SELECT l.id, l.title, l.baked_on, li.amount FROM log_ingredients li
              JOIN logs l ON l.id = li.log_id
              WHERE li.ingredient_id = ? ORDER BY l.baked_on DESC, l.created_at DESC`,
        args: [id],
      },
    ],
    "read",
  );
  const row = found.rows[0];
  if (!row) return null;
  return {
    ingredient: toIngredient(row),
    usage: usage.rows.map((r) => ({
      logId: str(r.id),
      title: str(r.title),
      bakedOn: str(r.baked_on),
      amount: str(r.amount),
    })),
  };
}
