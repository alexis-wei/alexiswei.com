export type TimelineStep = {
  id: string;
  time: string; // "HH:MM", may be empty
  text: string;
  roomTemp?: string; // room temperature at this step, free text, e.g. "23°C"
  humidity?: string; // room humidity at this step, free text, e.g. "48%"
  internalTemp?: string; // probe reading of the dough/bake itself, e.g. "74°C"
};

export type Ingredient = {
  id: string;
  name: string;
  origin: string; // where it's from
  details: string; // how it's made
  imageUrl: string | null; // the 720×720 icon
  sourceUrl: string | null; // the original, ≤720px, for re-cropping
  crop: SavedCrop | null; // how the icon was framed from the original
};

/**
 * How an icon was framed, independent of image resolution: the image's
 * top-left corner sits at (x, y) and the whole image is `width` wide, all in
 * units of the square's side.
 */
export type SavedCrop = { x: number; y: number; width: number };

/** A freshly uploaded icon. sourceKey is omitted when only the crop changed. */
export type IngredientImage = {
  imageKey: string;
  sourceKey?: string;
  crop: SavedCrop;
};

export type IngredientPatch = Partial<
  Pick<Ingredient, "name" | "origin" | "details">
>;

export type IngredientUsage = {
  logId: string;
  title: string;
  bakedOn: string;
  amount: string;
};

export type LogIngredient = {
  ingredientId: string;
  amount: string;
};

export type Media = {
  id: string;
  kind: "image" | "video";
  url: string;
  width: number | null;
  height: number | null;
  caption: string;
  takenAt: string | null; // phone clock time when captured, "YYYY-MM-DDTHH:MM:SS"
  stepId: string | null; // the timeline step it belongs to, if any
};

export type BakingLog = {
  id: string;
  title: string;
  bakedOn: string; // "YYYY-MM-DD"
  // "YYYY-MM-DDTHH:MM", or empty. Older logs may hold just "HH:MM", which
  // means that time on bakedOn (see toDateTime in format.ts).
  startTime: string;
  endTime: string;
  coverMediaId: string | null; // chosen cover; null means the first photo
  recipeUrl: string; // link to the recipe, may be empty
  recipeText: string; // a pasted recipe, as written, may be empty
  recipeFiles: RecipeFile[];
  process: string;
  notes: string;
  timeline: TimelineStep[];
  ingredients: LogIngredient[];
  media: Media[];
};

export type LogSummary = {
  id: string;
  title: string;
  bakedOn: string;
  startTime: string;
  endTime: string;
  cover: Media | null;
  ingredients: Ingredient[];
};

export type LogPatch = Partial<
  Pick<
    BakingLog,
    | "title"
    | "bakedOn"
    | "startTime"
    | "endTime"
    | "recipeUrl"
    | "recipeText"
    | "process"
    | "notes"
  >
>;

/** A recipe photo or PDF, stored exactly as uploaded (full resolution). */
export type RecipeFile = {
  id: string;
  url: string;
  name: string;
  contentType: string;
};

/** Editable fields of a timeline step. */
export type StepPatch = Partial<Omit<TimelineStep, "id">>;

export type UploadPurpose = "media" | "ingredient" | "recipe";
