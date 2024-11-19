"use client";

import CircleOne from "./CircleOne";
import RequestAnimationFrame from "./RequestAnimationFrame";
import UseAnimationFrame from "./UseAnimationFrame";

const Main: React.FC = () => {
  return (
    <div className="flex min-h-dvh w-dvw flex-col items-center justify-start gap-8 p-5 pb-32">
      <div className="flex h-fit w-full flex-col items-start gap-1 text-black">
        <h2 className="leading-none tracking-tighter">animating svgs</h2>
        <p className="font-serif text-xs font-bold text-stone-600">11/15/24</p>
        <p className="max-w-[400px] text-sm tracking-tighter">
          an exploration of editing raw svgs, comparing techniques between js
          and Motion (prev. framer motion)
        </p>
      </div>
      <div className="flex w-full max-w-[800px] flex-col items-start gap-12">
        <div className="flex h-full w-full flex-col gap-8">
          <h6>vanilla js vs using a library</h6>

          <div className="flex w-full flex-wrap items-start justify-center gap-8 sm:gap-12">
            <RequestAnimationFrame />
            <UseAnimationFrame />
          </div>
          <p className="text-sm">
            getting the same simple effect of expand on hover, where using{" "}
            <code>useAnimationFrame</code> about halves the amount of logic that
            needs to go into the code. However it is something that gets called
            on every single frame render and something that doesn't appear to
            have a way of stopping after component mount, and ticks off that
            little worry in my head on possible performance hit.
          </p>
        </div>
        <div className="flex w-full flex-col items-start justify-start gap-4">
          <h6>animation playground—testing out svg attributes</h6>
          <div className="flex flex-wrap gap-8">
            <CircleOne />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
