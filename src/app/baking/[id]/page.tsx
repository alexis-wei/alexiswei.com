import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LogEditor } from "@/components/baking/LogEditor";
import { isEditor } from "@/lib/baking/auth";
import { getLog, listIngredients, listRecipes } from "@/lib/baking/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const log = await getLog((await params).id);
  return { title: `${log?.title || "untitled"} | baking` };
}

export default async function LogPage({ params }: Props) {
  const { id } = await params;
  const [log, library, recipes, editor] = await Promise.all([
    getLog(id),
    listIngredients(),
    listRecipes(),
    isEditor(),
  ]);
  if (!log) notFound();
  return (
    <LogEditor
      log={log}
      library={library}
      recipes={recipes}
      editable={editor}
    />
  );
}
