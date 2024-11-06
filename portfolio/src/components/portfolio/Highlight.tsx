"use client";

import { motion } from "framer-motion";

import { FC, useEffect, useRef, useState } from "react";

interface HighlightProps {
  src: string;
  alt: string;
  description: string;
  type: "image" | "video";
}

const Highlight: FC<HighlightProps> = (props: HighlightProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  // const [scale, setScale] = useState(1);

  useEffect(() => {
    // const screenMidpoint = window.innerWidth / 2;
    setIsClient(true);
    // if (divRef && divRef.current) {

    //   const xPos = divRef.current.getBoundingClientRect().x + 144;
    //   const distanceToMid = Math.abs(screenMidpoint - xPos);
    //   const newScale = Math.max(1 - distanceToMid / screenMidpoint, 0.8);
    //   setScale(newScale);
    // }
  }, []);

  if (!isClient && props.type === "video") {
    return (
      <motion.div className="flex h-fit w-72 shrink-0 flex-col items-center gap-2 rounded-xl p-5 shadow-sm">
        <div className="h-[424px] w-[220px] animate-pulse rounded-3xl bg-stone-100"></div>
        <p className="text-center text-xs text-stone-600">
          {props.description}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex h-fit w-72 shrink-0 flex-col items-center gap-2 rounded-xl p-5 shadow-sm"
      // style={{ scale: scale }}
      ref={divRef}
    >
      {props.type === "image" ? (
        <img src={props.src} alt={props.alt} className="h-auto w-[220px]" />
      ) : (
        <video
          width="220"
          height="auto"
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

      <p className="text-center text-xs text-stone-600">{props.description}</p>
    </motion.div>
  );
};

export default Highlight;
