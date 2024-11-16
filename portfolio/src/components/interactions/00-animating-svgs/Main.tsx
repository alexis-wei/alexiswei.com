"use client";

import RequestAnimationFrame from "./RequestAnimationFrame";
import UseAnimationFrame from "./UseAnimationFrame";

const Main: React.FC = () => {
  return (
    <div className="flex h-dvh w-dvw flex-col items-center justify-between gap-8 p-5">
      <div className="flex h-fit w-full flex-col items-start text-black">
        <h2 className="tracking-tighter">animating svgs</h2>
        <p className="font-serif text-xs font-bold text-stone-600">11/15/24</p>
        <p className="max-w-[400px] text-sm tracking-tighter">
          an exploration of editing raw svgs, comparing techniques between js,
          Motion (prev. framer motion) and GSAP
        </p>
      </div>
      <div className="flex h-full flex-col gap-8">
        <RequestAnimationFrame />
        <UseAnimationFrame />
      </div>
    </div>
  );
};

export default Main;
