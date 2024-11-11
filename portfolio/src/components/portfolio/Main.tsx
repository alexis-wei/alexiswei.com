"use client";

import { FC, useEffect, useState } from "react";
import TheDrop from "./TheDrop";
import Spotlight from "./Spotlight";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface PortfolioProps {
  page: number;
}

const Main: FC<PortfolioProps> = (props: PortfolioProps): JSX.Element => {
  const [page, updatePage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    updatePage(props.page);
  }, []);

  const handleUpdatePage = (newPage: number) => {
    updatePage(newPage);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-col items-center">
        {page === 1 ? <TheDrop /> : <Spotlight />}
        <div className="flex w-full justify-between px-4 sm:px-8">
          <Button
            variant="ghost"
            className={`${page === 1 && "disabled invisible"}`}
            onClick={() => handleUpdatePage(page - 1)}
          >
            &#171; &nbsp; previous
          </Button>
          <Button
            variant="ghost"
            className={`${page === 2 && "disabled invisible"}`}
            onClick={() => handleUpdatePage(page + 1)}
          >
            next &nbsp; &#187;
          </Button>
        </div>
        <span className="pb-8 text-sm italic">
          love from,{" "}
          <Button
            variant="ghost"
            className="px-0 pb-8 text-sm italic"
            onClick={handleGoHome}
          >
            alexis
          </Button>
        </span>
      </div>
    </div>
  );
};

export default Main;
