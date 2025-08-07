"use client";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { use } from "react";

export default function ExplorationPage({
  params,
}: {
  params: Promise<{ title: string }>;
}) {
  const { title } = use(params);

  // Dynamically import the component based on slug
  const ExplorationComponent = dynamic(
    () => import(`@/components/bts/${title}`).catch(() => notFound()),
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
