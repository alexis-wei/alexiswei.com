import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IngredientEditor } from "@/components/baking/IngredientEditor";
import { isEditor } from "@/lib/baking/auth";
import { getIngredient } from "@/lib/baking/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await getIngredient((await params).id);
  return { title: `${found?.ingredient.name || "ingredient"} | baking` };
}

export default async function IngredientPage({ params }: Props) {
  const { id } = await params;
  const [found, editor] = await Promise.all([getIngredient(id), isEditor()]);
  if (!found) notFound();
  return (
    <IngredientEditor
      ingredient={found.ingredient}
      usage={found.usage}
      editable={editor}
    />
  );
}
