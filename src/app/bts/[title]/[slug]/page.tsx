"use client";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

export default function ExplorationDeeperPage({
  params,
}: {
  params: { title: string; slug: string };
}) {
  const ExplorationComponent = dynamic(
    () =>
      import(`@/components/bts/${params.title}/${params.slug}`).catch(() =>
        notFound(),
      ),
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
