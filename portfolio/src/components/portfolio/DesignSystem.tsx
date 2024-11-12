"use client";

import Header, { HeaderProps } from "./Header";

const designSystemHeaderProps: HeaderProps = {
  logoSrc:
    "https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/design-system/figma-logo.svg",
  category: "EXPLORATIONS",
  title: "design system",
  bgColor: "#E7E5E4",
  summary: `a company, brand or product cannot exist without its guiding principles and the bits and pieces that make up the greater picture. 
          this is an exploration to document, build and learn best practices while sharing a bit about my background processes. 
          i'll also be showing a bit of my inner dialogue, things that inspire me, and how i think through design.`,
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
    <div className="flex w-dvw flex-col items-start p-5">
      <Header {...designSystemHeaderProps} />
    </div>
  );
};

export default DesignSystem;
