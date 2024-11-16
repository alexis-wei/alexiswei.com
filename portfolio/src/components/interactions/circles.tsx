"use client";
import { useEffect, useRef, useState } from "react";
import { useAnimationFrame } from "framer-motion";

const Circles: React.FC = () => {
  const [xRad, setXRad] = useState(40);
  const [xRad2, setXRad2] = useState(40);
  const [currentAnimationFrame, setCurrentAnimationFrame] = useState<
    number | null
  >(null);

  const animateWidth = (target: number, dir: number, currVal?: number) => {
    let newValue = currVal ?? xRad;

    if (dir === 1) {
      if (xRad < target) {
        setXRad((prev) => {
          newValue = Math.min(prev + 3, target);
          return newValue;
        });
      }

      if (newValue < target) {
        const frame = requestAnimationFrame(() =>
          animateWidth(target, dir, newValue),
        );
        setCurrentAnimationFrame(frame);
      }
    } else if (dir === -1 && xRad > target) {
      setXRad((prev) => {
        newValue = Math.max(prev - 3, target);
        return newValue;
      });
      if (newValue > target) {
        const frame = requestAnimationFrame(() =>
          animateWidth(target, dir, newValue),
        );
        setCurrentAnimationFrame(frame);
      }
    }
  };

  const cancelCurrentAnimationFrame = () => {
    if (currentAnimationFrame) {
      window.cancelAnimationFrame(currentAnimationFrame);
    }
  };

  useAnimationFrame(() => {});

  return (
    <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <svg
          height="84"
          viewBox="0 0 204 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          onMouseEnter={() => {
            cancelCurrentAnimationFrame();
            requestAnimationFrame(() => animateWidth(100, 1));
          }}
          onMouseLeave={() => animateWidth(40, -1)}
          className="w-fit grow"
        >
          <path
            id="circle-1"
            d={`M ${String(102 + xRad + 1)} 42 A ${xRad} 40 0 1 1 ${String(102 + xRad + 1)} 41.999`}
            stroke="black"
            strokeWidth={2}
            fill="none"
          />
        </svg>
        <p className="text-sm">using requestAnimationFrame</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <svg
          height="84"
          viewBox="0 0 84 84"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          onMouseEnter={() => {
            cancelCurrentAnimationFrame();
            requestAnimationFrame(() => animateWidth(100, 1));
          }}
          onMouseLeave={() => animateWidth(42, -1)}
          className="w-fit"
        >
          <path
            id="circle-2"
            d={`M 82 42 A ${xRad2} 40 0 1 1 82 41.999`}
            stroke="black"
            strokeWidth={2}
            fill="none"
          />
        </svg>
        <p className="text-sm">using motion useAnimationFrame</p>
      </div>
    </div>
  );
};

export default Circles;
