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
  imageUrl: string | null;
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
  cover: Media | null;
  ingredients: Ingredient[];
};

export type LogPatch = Partial<
  Pick<
    BakingLog,
    | "title"
    | "bakedOn"
    | "roomTemp"
    | "humidity"
    | "process"
    | "notes"
    | "timeline"
  >
>;

export type UploadPurpose = "media" | "ingredient";
