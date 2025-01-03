"use client";

import { motion, useScroll, useTransform } from "motion/react";

import FireworksScene from "./Fireworks";

export default function Fireworks() {
  const { scrollYProgress } = useScroll();
  const frameScale = useTransform(scrollYProgress, [0, 1], [0.5, 1.2]);

  // moon animations
  const moonxPosition = useTransform(scrollYProgress, [0.1, 1], [-45, -20]);
  const moonScale = useTransform(scrollYProgress, [0.5, 0.8], [0.2, 0.3]);
  const moonOpacity = useTransform(scrollYProgress, [0, 0.15, 0.25], [0, 0, 1]);

  const frameDivSize = useTransform(frameScale, (scale) => 560 * scale);
  const moonxPositionPercent = useTransform(moonxPosition, (x) => `${x}%`);

  // couple animation
  const paperXPosition = useTransform(scrollYProgress, [0.2, 0.8], [-20, -5]);
  const paperScale = useTransform(scrollYProgress, [0.4, 0.7], [0.7, 0.9]);
  const paperOpacity = useTransform(scrollYProgress, [0, 0.2, 0.3], [0, 0, 1]);

  const paperXPositionPercent = useTransform(paperXPosition, (x) => `${x}%`);

  // fireworks animation
  const fireworksOpacity = useTransform(
    scrollYProgress,
    [0, 0.9, 1],
    [0, 0, 1],
  );

  return (
    <div className="min-h-[200vh] w-screen bg-black">
      <div className="fixed inset-0 flex items-center justify-center">
        <motion.div
          style={{ width: frameDivSize, height: frameDivSize, zIndex: 10 }}
          className="relative max-h-[100vw] max-w-[100vw]"
        >
          <motion.img
            src="/explorations/03-fireworks/moon.png"
            alt="moon"
            className="absolute"
            style={{
              scale: moonScale,
              x: moonxPositionPercent,
              zIndex: 10,
              opacity: moonOpacity,
              top: "-22%",
            }}
          />
          <motion.img
            src="/explorations/03-fireworks/paper-cutout-couple.png"
            alt="moon"
            className="absolute"
            style={{
              scale: paperScale,
              right: paperXPositionPercent,
              zIndex: 10,
              opacity: paperOpacity,
              bottom: "-5%",
            }}
          />
          <motion.div
            style={{ zIndex: 0, opacity: fireworksOpacity }}
            className="h-full w-full"
          >
            <FireworksScene />
          </motion.div>
        </motion.div>

        <motion.img
          src="/explorations/03-fireworks/vintage-picture-frame.png"
          alt="vintage picture frame"
          className="absolute"
          style={{ scale: frameScale, zIndex: 20 }}
        />
      </div>
    </div>
  );
}
