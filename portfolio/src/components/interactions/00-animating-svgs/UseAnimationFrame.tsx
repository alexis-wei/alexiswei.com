import { useAnimationFrame } from "framer-motion";
import { useState } from "react";
const UseAnimationFrame = () => {
  const [xRad, setXRad] = useState(40);
  const [animationState, setAnimationState] = useState<
    "grow" | "shrink" | null
  >(null);

  useAnimationFrame(() => {
    if (animationState === "grow" && xRad < 100) {
      const newVal = Math.min(100, xRad + 3);
      setXRad(newVal);
      if (newVal >= 100) {
        setAnimationState(null);
      }
      return;
    }
    if (animationState === "shrink" && xRad > 40) {
      const newVal = Math.max(40, xRad - 3);
      setXRad(newVal);
      if (newVal <= 40) {
        setAnimationState(null);
      }
    }
  });
  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        height="84"
        viewBox="0 0 204 84"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onMouseEnter={() => setAnimationState("grow")}
        onMouseLeave={() => setAnimationState("shrink")}
        className="w-fit"
      >
        <path
          id="circle-2"
          d={`M ${102 + xRad} 42 A ${xRad} 40 0 1 1 ${102 + xRad} 41.999`}
          stroke="black"
          strokeWidth={2}
          fill="none"
        />
      </svg>
      <p className="text-sm">
        using motion <span className="font-mono">useAnimationFrame</span>
      </p>
    </div>
  );
};

export default UseAnimationFrame;
