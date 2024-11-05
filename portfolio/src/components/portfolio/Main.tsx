"use client";

import { FC } from "react";
import TheDrop from "./TheDrop";

interface MainProps {}

const Main: FC<MainProps> = (): JSX.Element => {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <div className="flex w-full max-w-[1600px] items-center">
        <TheDrop />
      </div>
    </div>
  );
};

export default Main;
