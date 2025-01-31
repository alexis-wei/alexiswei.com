"use client";

import GlassStudy from "./GlassStudy";
import LightStudy from "./LightStudy";

const Main = () => {
  return (
    <div className="flex min-h-dvh w-dvw flex-col items-center justify-start gap-8 p-5 pb-32">
      <div className="flex h-fit w-full flex-col items-start gap-1 text-black">
        <h2 className="leading-none tracking-tighter">02-playing in 3d</h2>
        <p className="font-serif text-xs font-bold text-stone-600">11/21/24</p>
        <p className="max-w-[400px] text-sm tracking-tighter">
          setting up a scene in 3js, playing with different materials, lighting
          and the way 3d shape can impact and effect the outcome of the visuals.
          learning available libraries such as react 3 fiber and drei, trying to
          understand how each parameter can change the effects
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <GlassStudy />
        <LightStudy />
      </div>
    </div>
  );
};

export default Main;
