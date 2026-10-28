import type { Row } from "@libsql/client";
import { db } from "./db";
import { publicUrl } from "./storage";
import type {
  BakingLog,
  Ingredient,
  IngredientUsage,
  LogSummary,
  Media,
  Recipe,
  RecipeFile,
  RecipeUsage,
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
    caption: str(row.caption),
    takenAt: row.taken_at ? str(row.taken_at) : null,
    stepId: row.step_id ? str(row.step_id) : null,
  };
}

function toRecipeFile(row: Row): RecipeFile {
  return {
    id: str(row.id),
    url: publicUrl(str(row.key)),
    name: str(row.name),
    contentType: str(row.content_type),
  };
}

function toStep(row: Row): TimelineStep {
  return {
    id: str(row.id),
    time: str(row.time),
    text: str(row.text),
    roomTemp: str(row.room_temp),
    humidity: str(row.humidity),
    internalTemp: str(row.internal_temp),
  };
}

function toRecipe(row: Row, files: Row[]): Recipe {
  return {
    id: str(row.id),
    name: str(row.name),
    url: str(row.url),
    text: str(row.text),
    files: files.map(toRecipeFile),
  };
}

function filesByRecipe(rows: Row[]) {
  const map = new Map<string, Row[]>();
  for (const row of rows) {
    const list = map.get(str(row.recipe_id)) ?? [];
    list.push(row);
    map.set(str(row.recipe_id), list);
  }
  return map;
}

/** The recipe library, by name, each with its files. */
export async function listRecipes(): Promise<Recipe[]> {
  const [recipes, files] = await (
    await db()
  ).batch(
    [
      "SELECT * FROM recipes WHERE deleted_at IS NULL ORDER BY name COLLATE NOCASE, created_at",
      `SELECT f.* FROM recipe_files f JOIN recipes r ON r.id = f.recipe_id
       WHERE f.deleted_at IS NULL AND r.deleted_at IS NULL
       ORDER BY f.position`,
    ],
    "read",
  );
  const byRecipe = filesByRecipe(files.rows);
  return recipes.rows.map((row) =>
    toRecipe(row, byRecipe.get(str(row.id)) ?? []),
  );
}

export async function getRecipe(
  id: string,
): Promise<{ recipe: Recipe; usage: RecipeUsage[] } | null> {
  const [found, files, usage] = await (
    await db()
  ).batch(
    [
      {
        sql: "SELECT * FROM recipes WHERE id = ? AND deleted_at IS NULL",
        args: [id],
      },
      {
        sql: "SELECT * FROM recipe_files WHERE recipe_id = ? AND deleted_at IS NULL ORDER BY position",
        args: [id],
      },
      {
        sql: `SELECT l.id, l.title, l.baked_on FROM log_recipes lr
              JOIN logs l ON l.id = lr.log_id
              WHERE lr.recipe_id = ? AND l.deleted_at IS NULL
              ORDER BY l.baked_on DESC, l.created_at DESC`,
        args: [id],
      },
    ],
    "read",
  );
  const row = found.rows[0];
  if (!row) return null;
  return {
    recipe: toRecipe(row, files.rows),
    usage: usage.rows.map((r) => ({
      logId: str(r.id),
      title: str(r.title),
      bakedOn: str(r.baked_on),
    })),
  };
}

export async function listIngredients(): Promise<Ingredient[]> {
  const { rows } = await (
    await db()
  ).execute(
    "SELECT * FROM ingredients WHERE deleted_at IS NULL ORDER BY name COLLATE NOCASE",
  );
  return rows.map(toIngredient);
}

export async function listLogs(): Promise<LogSummary[]> {
  const [logs, covers, used] = await (
    await db()
  ).batch(
    [
      "SELECT id, title, baked_on, start_time, end_time FROM logs WHERE deleted_at IS NULL ORDER BY baked_on DESC, created_at DESC",
      // The chosen cover, else the first photo (else the first video).
      `SELECT m.* FROM logs l JOIN media m ON m.id = COALESCE(
         (SELECT id FROM media WHERE id = l.cover_media_id
            AND log_id = l.id AND deleted_at IS NULL),
         (SELECT id FROM media WHERE log_id = l.id AND deleted_at IS NULL
            ORDER BY kind = 'video', position LIMIT 1))
       WHERE l.deleted_at IS NULL`,
      `SELECT li.log_id, i.* FROM log_ingredients li
         JOIN ingredients i ON i.id = li.ingredient_id
         WHERE i.deleted_at IS NULL
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
  const [logs, ingredients, media, recipes, steps] = await (
    await db()
  ).batch(
    [
      {
        sql: "SELECT * FROM logs WHERE id = ? AND deleted_at IS NULL",
        args: [id],
      },
      {
        sql: "SELECT ingredient_id, amount FROM log_ingredients WHERE log_id = ? ORDER BY position",
        args: [id],
      },
      {
        sql: "SELECT * FROM media WHERE log_id = ? AND deleted_at IS NULL ORDER BY position",
        args: [id],
      },
      {
        sql: `SELECT lr.recipe_id FROM log_recipes lr
              JOIN recipes r ON r.id = lr.recipe_id
              WHERE lr.log_id = ? AND r.deleted_at IS NULL
              ORDER BY lr.position`,
        args: [id],
      },
      {
        sql: "SELECT * FROM timeline_steps WHERE log_id = ? ORDER BY position, created_at",
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
    coverMediaId: row.cover_media_id ? str(row.cover_media_id) : null,
    recipeIds: recipes.rows.map((r) => str(r.recipe_id)),
    process: str(row.process),
    notes: str(row.notes),
    timeline: steps.rows.map(toStep),
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
      {
        sql: "SELECT * FROM ingredients WHERE id = ? AND deleted_at IS NULL",
        args: [id],
      },
      {
        sql: `SELECT l.id, l.title, l.baked_on, li.amount FROM log_ingredients li
              JOIN logs l ON l.id = li.log_id
              WHERE li.ingredient_id = ? AND l.deleted_at IS NULL ORDER BY l.baked_on DESC, l.created_at DESC`,
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
