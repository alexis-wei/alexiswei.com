"use client";

import { motion } from "motion/react";

import { FC, useEffect, useRef, useState } from "react";
import Image from "next/image";

interface HighlightProps {
  src: string;
  alt: string;
  subheading: string;
  description: string;
  type: "image" | "video";
}

const Highlight: FC<HighlightProps> = (props: HighlightProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient && props.type === "video") {
    return (
      <motion.div className="flex h-[520px] w-[320px] shrink-0 flex-col items-center gap-4 p-5 shadow">
        <div className="h-[388px] w-[220px] animate-pulse rounded-3xl bg-stone-100"></div>
        <p className="text-center text-xs text-stone-600 md:text-sm">
          {props.description}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`mx-[7px] flex h-[520px] w-[320px] shrink-0 flex-col items-center gap-4 border-black bg-white p-5 shadow duration-300 hover:mx-0 hover:border ${"transition-spacing-and-colors"}`}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      ref={divRef}
    >
      {props.type === "image" ? (
        <div className="relative h-[440px] w-full">
          <Image
            src={props.src}
            alt={props.alt}
            sizes="440px"
            fill
            className="object-contain"
          />
        </div>
      ) : (
        <video
          className="h-[388px] w-auto object-contain"
          ref={videoRef}
          playsInline
          muted
          autoPlay
          loop
        >
          <source src={props.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      <p className="h-fit grow-0 text-center text-xs text-stone-600 md:text-sm">
        <b>{props.subheading}: </b>
        {props.description}
      </p>
    </motion.div>
  );
};

export default Highlight;
