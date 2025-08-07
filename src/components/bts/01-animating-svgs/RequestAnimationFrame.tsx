import { useState } from "react";

const RequestAnimationFrame: React.FC = () => {
  const [xRad, setXRad] = useState(40);
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

  return (
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
        className="w-fit grow cursor-pointer"
      >
        <path
          id="circle-1"
          d={`M ${String(102 + xRad)} 42 A ${xRad} 40 0 1 1 ${String(102 + xRad)} 41.999`}
          stroke="black"
          strokeWidth={2}
          fill="none"
        />
      </svg>
      <p className="max-w-72 text-center text-sm">
        using{" "}
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame"
          target="_blank"
          className="hover:underline"
        >
          <code>requestAnimationFrame</code>
        </a>
        , a part of the standard <code>js</code> library
      </p>
    </div>
  );
};

export default RequestAnimationFrame;
