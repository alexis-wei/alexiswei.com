import { useAnimationFrame } from "framer-motion";
import { interpolate } from "flubber";
import { useState, useMemo } from "react";

const MorphingCircle: React.FC = () => {
  const [progress, setProgress] = useState(0);

  const ellipsePath = "M12,32 A20,20 0 1,1 52,32 A20,20 0 1,1 12,32";
  const rectPath = "M12,12 L52,12 L52,52 L12,52 Z";

  const interpolator = useMemo(
    () => interpolate(ellipsePath, rectPath, { maxSegmentLength: 2 }),
    [],
  );

  useAnimationFrame((_, delta) => {
    setProgress((prev) => {
      const next = prev + delta / 5000;
      return next > 1 ? 0 : next;
    });
  });

  const currentPath = interpolator(
    Math.sin(progress * Math.PI * 2) * 0.5 + 0.5,
  );

  return (
    <div className="flex h-24 max-w-60 items-center justify-start gap-6 border px-6 py-3">
      <svg viewBox="0 0 64 64">
        <path strokeWidth="1" d={currentPath} stroke="black" fill="none" />
      </svg>
      <p className="w-full text-xs">
        morphing across circle and rect with <code>flubber</code>
      </p>
    </div>
  );
};

export default MorphingCircle;
