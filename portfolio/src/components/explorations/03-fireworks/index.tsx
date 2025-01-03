"use client";

import { motion, useScroll, useTransform } from "motion/react";

import Scene2 from "./Scene2";

export default function Fireworks() {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [0.5, 1.2]);

  return (
    <div className="min-h-[200vh] w-screen bg-black">
      <div className="fixed inset-0 grid place-items-center">
        <motion.img
          src="/explorations/03-fireworks/vintage-picture-frame.png"
          alt="vintage picture frame"
          style={{ scale }}
        />
      </div>
    </div>
  );
}
