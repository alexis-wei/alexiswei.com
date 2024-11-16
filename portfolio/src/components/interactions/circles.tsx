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
    <div className="flex h-dvh w-dvw flex-col items-center justify-between gap-8 p-5">
      <div className="flex h-fit w-full flex-col items-start text-black">
        <h2 className="tracking-tighter">animating svgs</h2>
        <p className="font-serif text-xs font-bold text-stone-600">15/11/24</p>
        <p className="max-w-[400px] text-sm tracking-tighter">
          an exploration of editing raw svgs, comparing techniques between js,
          Motion (prev. framer motion) and GSAP
        </p>
      </div>
      <div className="flex h-full flex-col gap-2">
        <div className="flex flex-col items-center gap-2">
          <svg
            height="84"
            viewBox="0 0 204 84"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onMouseEnter={() => {
              cancelCurrentAnimationFrame();
              requestAnimationFrame(() => animateWidth(100, 1));
            }}
            onMouseLeave={() => {
              cancelCurrentAnimationFrame();
              requestAnimationFrame(() => animateWidth(40, -1));
            }}
            className="w-fit grow"
          >
            <path
              id="circle-1"
              d={`M ${String(102 + xRad)} 42 A ${xRad} 40 0 1 1 ${String(102 + xRad)} 41.999`}
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
    </div>
  );
};

export default Circles;
