export type TimelineStep = {
  id: string;
  time: string; // "HH:MM", may be empty
  text: string;
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
};

export type BakingLog = {
  id: string;
  title: string;
  bakedOn: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM", may be empty
  endTime: string; // "HH:MM", may be empty
  roomTemp: string; // free text, e.g. "22°C"
  humidity: string; // free text, e.g. "45%"
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
    | "roomTemp"
    | "humidity"
    | "process"
    | "notes"
    | "timeline"
  >
>;

export type UploadPurpose = "media" | "ingredient";
