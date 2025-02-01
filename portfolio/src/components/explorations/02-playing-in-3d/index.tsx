"use client";

import GlassStudy from "./GlassStudy";
import LightStudy from "./LightStudy";
import { ExplorationIntro } from "../ui";

const Main = () => {
  const introDescription = `setting up a scene in 3js, playing with different materials, lighting
          and the way 3d shape can impact and effect the outcome of the visuals.
          learning available libraries such as react 3 fiber and drei, trying to
          understand how each parameter can change the effects`;
  return (
    <div className="flex min-h-dvh w-dvw flex-col items-center justify-start gap-8 p-5 pb-32">
      <ExplorationIntro
        name="02-playing in 3d"
        description={introDescription}
        date="11/21/24"
      />
      <div className="flex flex-col gap-6">
        <GlassStudy />
        <LightStudy />
      </div>
    </div>
  );
};

export default Main;
