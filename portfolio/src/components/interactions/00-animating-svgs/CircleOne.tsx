import { useAnimationFrame } from "framer-motion";
import { useState } from "react";
const CircleOne = () => {
  const [percentage, setPercentage] = useState(1);
  const circumference = Math.PI * 2 * 20;

  useAnimationFrame((_, delta) => {
    setPercentage((percent) => {
      const addition = (delta / 10000) * circumference * 10;
      return addition + percent > circumference ? 0 : addition + percent;
    });
  });

  return (
    <div className="flex items-start justify-start gap-8 border px-8 py-6">
      <svg
        height="44"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-fit cursor-pointer"
      >
        <path
          id="circle-2"
          strokeDasharray={`${percentage} 200 0`}
          d={`M 42 22 A 20 20 0 1 1 42 21.999`}
          strokeLinecap="round"
          stroke="black"
          strokeWidth={2}
          fill="none"
        />
      </svg>
      <p className="w-20 text-wrap text-xs">possible loader animation</p>
    </div>
  );
};

export default CircleOne;
