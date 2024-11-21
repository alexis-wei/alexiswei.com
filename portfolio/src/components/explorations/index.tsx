"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

const ExplorationsHome = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-8 p-6">
      <h1 className="w-full text-start tracking-tighter">explorations</h1>
      <div className="flex w-full flex-wrap items-start justify-start gap-4">
        <Button
          variant="outline"
          onClick={() => {
            router.push("/explorations/01-animating-svgs");
          }}
          className="flex h-40 w-[400px] flex-col items-center justify-start rounded-none py-4 text-start"
        >
          <h6>01-animating svgs</h6>
          <p className="text-wrap">
            an exploration of editing raw svgs, comparing techniques between js
            & Motion (prev. framer motion) and testing out unique svg attributes
            that allow for animations
          </p>
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            router.push("/explorations/02-playing-in-3d");
          }}
          className="flex h-40 w-[400px] flex-col items-center justify-start rounded-none py-4 text-start"
        >
          <h6>02-playing in 3d</h6>
          <p className="truncate text-wrap">
            from setting up a scene in 3js to how to use shaders. a wide range
            of topics with so many variables to think through. trying to explore
            how to make realistic effects through combining tools and available
            libraries such as react 3 fiber and drei, trying to understand how
            each parameter can change the effects
          </p>
        </Button>
      </div>
    </div>
  );
};

export default ExplorationsHome;
