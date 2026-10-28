import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecipeEditor } from "@/components/baking/RecipeEditor";
import { isEditor } from "@/lib/baking/auth";
import { getRecipe } from "@/lib/baking/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await getRecipe((await params).id);
  return { title: `${found?.recipe.name || "recipe"} | baking` };
}

export default async function RecipePage({ params }: Props) {
  const { id } = await params;
  const [found, editor] = await Promise.all([getRecipe(id), isEditor()]);
  if (!found) notFound();
  return (
    <RecipeEditor recipe={found.recipe} usage={found.usage} editable={editor} />
  );
}
