"use client";
import { FC } from "react";
import Image from "next/image";

interface SummaryProps {
  role: string;
  timeline: string;
  projectType: string;
}

const Summary: FC<SummaryProps> = ({ role, timeline, projectType }) => {
  return (
    <div className="flex w-full flex-col items-end text-nowrap md:items-start">
      <p className="text-sm italic md:text-base">{role}</p>
      <p className="text-sm md:text-base">{timeline}</p>
      <p className="text-sm font-bold md:text-base">{projectType}</p>
    </div>
  );
};

export interface HeaderProps {
  logoSrc: string;
  bgColor: string;
  category: string;
  title: string;
  summary: string;
  about: string;
  focus: string[];
  role: string;
  timeline: string;
  projectType: string;
}

const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
  return (
    <div className="flex h-fit w-full max-w-[dvw] grow flex-col items-center gap-6 md:gap-8">
      <div
        className="flex h-[50dvw] min-h-72 w-full items-center justify-center md:h-96"
        style={{ backgroundColor: props.bgColor }}
      >
        <div className="relative h-16 w-16">
          <Image
            src={props.logoSrc}
            sizes="64"
            fill
            alt="logo"
            className="object-contain"
          />
        </div>
      </div>
      <div className="flex h-full w-full max-w-[1200px] flex-col items-start justify-between gap-8 border border-stone-700 p-5 md:flex-row">
        <div className="flex w-full min-w-44 shrink-0 flex-row items-stretch justify-between gap-0 md:w-fit md:flex-col md:gap-8 lg:h-full">
          <div className="flex w-fit flex-col gap-2 text-nowrap">
            <div className="w-fit bg-stone-400 px-3 py-1">
              <p className="text-xxs font-extrabold uppercase tracking-widest text-white md:text-xs">
                {props.category}
              </p>
            </div>
            <h4 className="text-xl sm:text-2xl">&quot;{props.title}&quot;</h4>
          </div>

          <Summary
            role={props.role}
            timeline={props.timeline}
            projectType={props.projectType}
          />
        </div>
        <div className="flex w-full flex-col gap-6 md:gap-4 lg:flex-row lg:gap-8">
          <p className="text-full w-full max-w-[420px] text-sm md:text-base">
            {props.summary}
          </p>
          <div className="flex w-full gap-4">
            <div className="flex w-full flex-col gap-1">
              <p className="text-xs font-extrabold uppercase tracking-widest text-stone-400 md:text-sm">
                ABOUT
              </p>
              <p className="text-sm md:text-base">{props.about}</p>
            </div>
            <div className="flex w-full flex-col gap-1">
              <p className="text-xs font-extrabold uppercase tracking-widest text-stone-400 md:text-sm">
                CONSIDERATIONS
              </p>
              <ul className="ml-1 flex list-inside list-none flex-col flex-nowrap gap-0.5">
                {props.focus.map((item, index) => (
                  <li
                    key={index}
                    className="-ml-1 flex gap-1.5 text-sm md:text-base"
                  >
                    <span>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
