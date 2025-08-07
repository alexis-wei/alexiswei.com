"use client";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { use } from "react";

export default function ExplorationDeeperPage({
  params,
}: {
  params: Promise<{ title: string; slug: string }>;
}) {
  const { title, slug } = use(params);

  const ExplorationComponent = dynamic(
    () => import(`@/components/bts/${title}/${slug}`).catch(() => notFound()),
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
