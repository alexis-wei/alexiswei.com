"use client";

import { FC } from "react";
import Header, { HeaderProps } from "./Header";

const Spotlight: FC = () => {
  const spotlightHeaderProps: HeaderProps = {
    logoSrc:
      "https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/spotlight/lamp-sticker.png",
    category: "branding",
    title: "spotlight hacks",
    bgColor: "#DFEAEA",
    summary:
      "a partnership with Entrepreneur First, a leading global accelerator, to create brand designs for a series of hackathons to run throughout the year. I got to develop the designs from scratch, from the name of the event & logo to social media posts & merch ideas. With a goal for this to be a series to be remembered in the european technology startup space.",
    about:
      "a series of hackathons hosted by Entrepreneur First, each with a different theme (hardware, consumer, gaming, etc)",
    focus: [
      "naming and concept",
      "reusable and recognizable logo",
      "appeal to a wide range of engineers",
    ],
    role: "logo + social media",
    timeline: "1 week",
    projectType: "event branding",
  };

  return (
    <div className="relative flex h-full w-full max-w-[dvw] grow flex-col items-center gap-8 p-5 pb-60 font-sans md:gap-16">
      <Header {...spotlightHeaderProps} />
    </div>
  );
};

export default Spotlight;
