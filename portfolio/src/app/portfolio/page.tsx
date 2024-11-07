"use client";

import Main from "@/components/portfolio/Main";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function MainDiv() {
  const searchParams = useSearchParams();

  const page = Number(searchParams?.get("page")) || 1;

  return <Main page={page} />;
}

const Portfolio = () => {
  return (
    <Suspense>
      <MainDiv />
    </Suspense>
  );
};

export default Portfolio;
