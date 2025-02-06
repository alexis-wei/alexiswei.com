"use client";

import DisplayComparisons from "./DisplayComparisons";
import { DescriptionText, ExplorationIntro, SectionHeading } from "../ui";
import HoverToExpand from "./HoverToExpand";

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
        <SectionHeading>
          part 01: how do i get these images to show up?
        </SectionHeading>
        <DisplayComparisons />
        <DescriptionText>
          there are 2 ways in <code>three.js</code> to load images onto your
          mesh to be displayed, and a surprise finding while experimenting was
          learning that the color output from the two methods are actually
          different, and are also different from using your basic
          <code>{`<img>`}</code>. As you can see above, with the same photo,
          with <code>{`<img>`}</code> as reference (assuming it has the most
          accurate color processing),
          <code>meshBasicMaterial</code> results in a lighter, more washed out
          tone while a basic custom shader brings out more shadows. both
          canvases have no additional lighting added
        </DescriptionText>
        <DescriptionText>
          so much of creative coding and art is really about understanding your
          medium and tools, just like how different brands of paint and paint
          brushes create art differently
        </DescriptionText>
        <SectionHeading>part 02: hover to expand</SectionHeading>
        <HoverToExpand />
        <DescriptionText>
          from this moment, things are starting to click. this hover transition
          animation is incredibly smooth and it&apos;s from here where i see a
          lot of possibilities of what shaders, the thoughtfulness behind the
          motion, and the transitions that learning this can unlock
        </DescriptionText>
      </div>
    </div>
  );
}
