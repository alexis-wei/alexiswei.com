"use client";

import DisplayComparisons from "./DisplayComparisons";
import { DescriptionText, ExplorationIntro, SectionHeading } from "../ui";
import HoverToExpand from "./HoverToExpand";
import AddingText from "./AddingText";

export default function ShaderAnimations() {
  const introDescription = `i learned a couple of days ago why people use shaders. 
  it's what i originally thought was only for 3d effects and making something look real, 
  but the way it's able to get incredibly smooth image transitions is something that i've 
  never been able to achieve in css with the same effectiveness. here's a bts of how i made this effect, step by step`;
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
        <SectionHeading>Adding Text</SectionHeading>
        <AddingText />
        <DescriptionText>
          adding the text and the animations in the way that i envisioned in my
          head was actually extremely easy from here. The most difficult part in
          this entire process was figuring out the right shader logic to create
          smooth transitions. it's all design and intuition from here
        </DescriptionText>
        <DescriptionText>happy coding!</DescriptionText>
      </div>
    </div>
  );
}
