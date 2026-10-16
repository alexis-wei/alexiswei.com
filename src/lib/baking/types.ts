export type TimelineStep = {
  id: string;
  time: string; // "HH:MM", may be empty
  text: string;
};

export type Ingredient = {
  id: string;
  name: string;
  imageUrl: string | null;
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
  Pick<BakingLog, "title" | "bakedOn" | "process" | "notes" | "timeline">
>;

export type UploadPurpose = "media" | "ingredient";
