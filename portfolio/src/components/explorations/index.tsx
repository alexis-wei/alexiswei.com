"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

const ExplorationsHome = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-8 p-6">
      <h1 className="w-full text-start tracking-tighter">explorations</h1>
      <div className="flex w-full flex-wrap items-start justify-start">
        <Button
          variant="outline"
          onClick={() => {
            router.push("/explorations/01-animating-svgs");
          }}
          className="flex h-fit w-[400px] flex-col py-4 text-start"
        >
          <h6>animating svgs</h6>
          <p className="text-wrap">
            an exploration of editing raw svgs, comparing techniques between js
            & Motion (prev. framer motion) and testing out unique svg attributes
            that allow for animations
          </p>
        </Button>
      </div>
    </div>
  );
};

export default ExplorationsHome;
