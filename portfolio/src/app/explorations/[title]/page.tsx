"use client";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

export default function ExplorationPage({
  params: { title },
}: {
  params: { title: string };
}) {
  // Dynamically import the component based on slug
  const ExplorationComponent = dynamic(
    () => import(`@/components/explorations/${title}`).catch(() => notFound()),
    {
      ssr: false,
      loading: () => <div>Loading...</div>,
    },
  );

  return (
    <div>
      <ExplorationComponent />
    </div>
  );
}
