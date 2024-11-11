"use client";

import { FC, useEffect, useState } from "react";
import TheDrop from "./TheDrop";
import Spotlight from "./Spotlight";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import classes from "@/lib/global.module.css";

interface PortfolioProps {
  page: number;
}

const Main: FC<PortfolioProps> = (props: PortfolioProps): JSX.Element => {
  const [page, setPage] = useState(0);
  const [hideLoader, setHideLoader] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setPage(props.page ?? 1);
    setTimeout(() => {
      setHideLoader(true);
    }, 260);
  }, []);

  const handleUpdatePage = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center">
      <div
        className={`flex h-dvh flex-col items-center justify-center gap-6 transition-opacity duration-300 fade-in fade-out ${page ? "opacity-0" : "opacity-100"} ${hideLoader ? "hidden" : ""} `}
      >
        <div className={`${classes.loader}`} />
        <p className="font-serif text-base font-bold tracking-[-0.08em]">
          loading
        </p>
      </div>
      <div
        className={`flex w-full flex-col items-center transition-opacity duration-300 fade-in fade-out ${page !== 0 ? "opacity-100" : "opacity-0"} ${hideLoader ? "" : "hidden"}`}
      >
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
