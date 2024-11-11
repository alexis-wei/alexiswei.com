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
  const [hideLoader, setHideLoader] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setHideLoader(true);
    }, 260);
  }, []);

  const handleUpdatePage = (newPage: number) => {
    router.push(`/portfolio?page=${newPage}`);
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center">
      <div
        className={`flex h-dvh flex-col items-center justify-center gap-6 transition-opacity duration-300 fade-in fade-out ${props.page ? "opacity-0" : "opacity-100"} ${hideLoader ? "hidden" : ""} `}
      >
        <div className={`${classes.loader}`} />
        <p className="font-serif text-base font-bold tracking-[-0.08em]">
          loading
        </p>
      </div>
      <div
        className={`relative flex w-full flex-col items-center transition-opacity duration-300 fade-in fade-out ${props.page !== 0 ? "opacity-100" : "opacity-0"} ${hideLoader ? "" : "hidden"}`}
      >
        <Button
          className="absolute left-6 top-8 z-10 flex items-center text-stone-800 hover:font-bold hover:text-stone-950"
          variant="ghost"
          onClick={() => {
            router.push("/");
          }}
        >
          <span className="text-center font-serif text-sm italic">
            &#171; &nbsp;home
          </span>
        </Button>
        {props.page === 1 ? <TheDrop /> : <Spotlight />}
        <div className="flex w-full justify-between px-4 sm:px-8">
          <Button
            variant="ghost"
            className={`${props.page === 1 && "disabled invisible"}`}
            onClick={() => handleUpdatePage(props.page - 1)}
          >
            &#171; &nbsp; previous
          </Button>
          <Button
            variant="ghost"
            className={`${props.page === 2 && "disabled invisible"}`}
            onClick={() => handleUpdatePage(props.page + 1)}
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
