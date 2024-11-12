"use client";

import { Button } from "../ui/button";
import Header, { HeaderProps } from "./Header";

const designSystemHeaderProps: HeaderProps = {
  logoSrc:
    "https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/design-system/figma-logo.svg",
  category: "EXPLORATIONS",
  title: "design system",
  bgColor: "#E7E5E4",
  summary: `a company, brand or product cannot exist without its guiding principles and the bits and pieces that make up the greater picture. 
          this is an exploration to document, build and learn best practices while sharing a bit about my background processes. 
          i'll be showing a bit of my inner dialogue, things that inspire me, and how i think through design.`,
  about:
    "personalized design system encompassing components and thoughts that created [alexiswei.com]",
  focus: [
    "consistent styles across components",
    "reusability across site",
    "accessibility",
    "does it feel representative of me?",
  ],
  role: "figma",
  timeline: "",
  projectType: "WIP",
};

const DesignSystem = () => {
  return (
    <div className="flex w-dvw flex-col items-center gap-4 p-5 lg:gap-8">
      <Header {...designSystemHeaderProps} />
      <div className="flex w-full max-w-[1200px] grow justify-end">
        <Button
          variant="outline"
          className="rounded-none font-serif font-bold shadow-md hover:border-stone-600 hover:bg-[#E7E5E4] hover:shadow-none"
          onClick={() => {
            window.open(
              "https://www.figma.com/design/mLZNKHrAKzrj7CFIGPLLGl/alexiswei.com-design-system?node-id=0-1&t=IwQpGyGOaysVkZgq-1",
            );
          }}
        >
          enter figma <span className="mb-1 p-0 text-2xl">&#x21D7;</span>
        </Button>
      </div>
    </div>
  );
};

export default DesignSystem;
