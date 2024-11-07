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
      <div className="flex w-full max-w-[1600px] items-center">
        {props.page === 1 ? <TheDrop /> : <Spotlight />}
      </div>
    </div>
  );
};

export default Main;
