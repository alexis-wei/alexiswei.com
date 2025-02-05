"use client";

import PhotoCanvasOne from "./PhotoCanvasOne";
import { DescriptionText, ExplorationIntro } from "../ui";

export default function ShaderAnimations() {
  const introDescription = `vertex and color changes as a result of shader value tracking. 
  playing with vacation photos, variables such as time, position to create fun effects`;
  return (
    <div className="flex min-h-dvh w-dvw flex-col items-center justify-start gap-8 p-5 pb-32">
      <ExplorationIntro
        name="05-shader-animations"
        description={introDescription}
        date="02/05/25"
      />
      <div className="flex flex-col gap-6">
        <PhotoCanvasOne />
        <DescriptionText>
          there are 2 ways in threejs to load photos onto your mesh to be
          displayed, either through texture mapping or through shaders. to my
          surprise, the color output from the two methods are actually
          different, and as a basicMeshMaterial, a different color output than
          as an img
        </DescriptionText>
      </div>
    </div>
  );
}
