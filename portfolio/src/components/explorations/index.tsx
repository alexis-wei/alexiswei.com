"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface ExplorationButtonProps {
  url: string;
  heading: string;
  description: string;
}

const EXPLORATIONS: ExplorationButtonProps[] = [
  {
    url: "/explorations/03-fireworks",
    heading: "03-fireworks",
    description:
      `trying out shader coding for the first time, creating a fireworks scene with GSAP`
        .replace(/\s+/g, " ")
        .trim(),
  },
  {
    url: "/explorations/02-playing-in-3d",
    heading: "02-playing in 3d",
    description: `setting up a scene in 3js, playing with different materials, 
    lighting and the way 3d shape can impact and effect the outcome of the visuals
  `
      .replace(/\s+/g, " ")
      .trim(),
  },
  {
    url: "/explorations/01-animating-svgs",
    heading: "01-animating svgs",
    description:
      `an exploration of editing raw svgs, comparing techniques between js 
      & Motion (prev. framer motion) and testing out unique svg attributes that allow for animations`
        .replace(/\s+/g, " ")
        .trim(),
  },
];

const ExplorationButton = ({
  url,
  heading,
  description,
}: ExplorationButtonProps) => {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      onClick={() => {
        router.push(url);
      }}
      className="flex h-40 flex-col items-center justify-start rounded-none py-4 text-start"
    >
      <h6>{heading}</h6>
      <p className="truncate text-wrap">{description}</p>
    </Button>
  );
};

const ExplorationsHome = () => {
  const router = useRouter();
  return (
    <main className="flex w-screen items-center justify-center">
      <div className="flex max-w-[1200px] flex-col items-center gap-8 p-6">
        <div className="flex w-full flex-col items-start gap-2">
          <h1 className="text-start tracking-tighter">explorations</h1>
          <p className="max-w-[480px]">est. nov 2024</p>
          <p className="max-w-[480px]">welcome to my learning drafts center</p>
          <p className="max-w-[480px]">
            the idea of this page is to document my raw, authentic thoughts and
            learning process. these are not meant to be perfect or necessarily
            even complete code examples, but rather explorations of different
            ideas in a free form way, growing my garden of knowledge.
          </p>
          <p className="max-w-[480px]">happy clicking!</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {EXPLORATIONS.map((exploration) => (
            <ExplorationButton key={exploration.url} {...exploration} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default ExplorationsHome;
