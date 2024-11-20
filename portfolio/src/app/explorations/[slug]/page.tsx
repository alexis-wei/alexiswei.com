"use client";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

export default async function ExplorationPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  // Dynamically import the component based on slug
  const ExplorationComponent = dynamic(
    () => import(`@/components/explorations/${slug}`).catch(() => notFound()),
    {
      ssr: false, // Set to true if you want server-side rendering
    },
  );

  return (
    <div>
      <ExplorationComponent />
    </div>
  );
}
