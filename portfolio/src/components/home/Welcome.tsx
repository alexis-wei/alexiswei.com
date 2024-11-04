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
    <div className="w-dvh absolute flex h-dvh flex-col items-center justify-center gap-24 bg-white py-60">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative flex h-[120px] w-60 items-center justify-center duration-700 fade-in fade-out">
          <Saturn />
        </div>
        <p className="font-serif font-bold leading-tight">welcome</p>
      </div>
      <Button
        size="sm"
        variant="link"
        color="dark.7"
        onClick={handleEnter}
        className="left-[-1] min-h-10 hover:font-medium"
      >
        &#187; &nbsp; enter alexis&apos; world
      </Button>
    </div>
  );
}
