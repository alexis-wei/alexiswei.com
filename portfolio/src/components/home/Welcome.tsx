"use client";
import Saturn from "./Saturn";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Welcome() {
  const [visible, setVisible] = useState(true);

  const handleEnter = () => {
    setVisible(false);
  };

  return (
    <div
      className={`w-dvh absolute flex h-dvh w-dvw flex-col items-center justify-center gap-24 bg-white py-60 ${visible ? "" : "hidden"}`}
    >
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="relative flex h-[120px] w-60 items-center justify-center">
          <Saturn />
        </div>
        <p className="font-serif text-base font-bold tracking-[-0.08em]">
          welcome
        </p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleEnter}
        className="left-[-1] min-h-10 tracking-tight"
      >
        &#187; &nbsp; enter alexis&apos; world
      </Button>
    </div>
  );
}
