import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

export default async function ExplorationPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  // Dynamically import the component based on slug
  const InteractionComponent = dynamic(
    () => import(`@/components/interactions/${slug}`).catch(() => notFound()),
    {
      ssr: false, // Set to true if you want server-side rendering
    },
  );

  return (
    <div>
      <InteractionComponent />
    </div>
  );
}
