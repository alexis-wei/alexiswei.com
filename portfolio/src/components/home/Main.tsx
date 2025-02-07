"use client";

import SocialMedia from "@/lib/SocialMedia";

export default function Main() {
  return (
    <div className="flex h-dvh w-dvw items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-xs">alexiswei.com is</p>
        <img
          src="/animations/under-construction.gif"
          alt="Under Construction"
          width={240}
          height={240}
        />
        <div className="flex flex-col items-center">
          <p className="font-mono text-xs">meanwhile you can find me @</p>
          <SocialMedia />
        </div>
      </div>
    </div>
  );
}
