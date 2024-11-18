"use client";

import CircleOne from "./CircleOne";
import RequestAnimationFrame from "./RequestAnimationFrame";
import UseAnimationFrame from "./UseAnimationFrame";

const Main: React.FC = () => {
  return (
    <div className="flex min-h-dvh w-dvw flex-col items-center justify-start gap-8 p-5 pb-32">
      <div className="flex h-fit w-full flex-col items-start text-black">
        <h2 className="tracking-tighter">animating svgs</h2>
        <p className="font-serif text-xs font-bold text-stone-600">11/15/24</p>
        <p className="max-w-[400px] text-sm tracking-tighter">
          an exploration of editing raw svgs, comparing techniques between js
          and Motion (prev. framer motion)
        </p>
      </div>
      <div className="flex w-full max-w-[1000px] flex-col items-start gap-12">
        <div className="flex h-full w-full flex-col gap-4">
          <h6>hover to animate</h6>
          <RequestAnimationFrame />
          <UseAnimationFrame />
          <p className="max-w-[480px]">
            using useAnimationFrame about halves the amount of logic that needs
            to go into the code
          </p>
        </div>
        <div className="flex w-full flex-col items-start justify-start gap-4">
          <h6>circle-based animation playground</h6>
          <div className="flex flex-wrap gap-8">
            <CircleOne />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
