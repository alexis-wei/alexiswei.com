"use client";

import { FC } from "react";
import TheDrop from "./TheDrop";
import Spotlight from "./Spotlight";

interface PortfolioProps {
  page: number;
}

const Main: FC<PortfolioProps> = (props: PortfolioProps): JSX.Element => {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <div className="flex w-full max-w-[1600px] flex-col items-center">
        {props.page === 1 ? <TheDrop /> : <Spotlight />}
        <p className="pb-8 text-sm italic">love from, alexis</p>
      </div>
    </div>
  );
};

export default Main;
