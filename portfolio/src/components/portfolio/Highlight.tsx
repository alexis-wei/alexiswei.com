"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FC, useEffect, useRef } from "react";

interface HighlightProps {
  src: string;
  alt: string;
  description: string;
  type: "image" | "video";
}

const Highlight: FC<HighlightProps> = (props: HighlightProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (props.type === "video" && videoRef.current) {
      videoRef.current.load();
    }
  }, []);
  return (
    <motion.div className="flex h-fit w-72 shrink-0 flex-col items-center gap-2 rounded-xl p-5 shadow-sm">
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

      <p className="text-xxs text-center text-stone-600">{props.description}</p>
    </motion.div>
  );
};

export default Highlight;
