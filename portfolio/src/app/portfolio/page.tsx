"use client";

import Main from "@/components/portfolio/Main";
import { useSearchParams } from "next/navigation";

const Portfolio = () => {
  const searchParams = useSearchParams();
  const page = Number(searchParams?.get("page")) || 1;

  return <Main page={page} />;
};

export default Portfolio;
