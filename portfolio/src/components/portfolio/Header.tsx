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
    <div className="flex w-fit min-w-36 flex-col items-end gap-0.5 text-nowrap">
      <p className="text-sm italic">{role}</p>
      <p className="text-sm">{timeline}</p>
      <p className="text-sm font-bold">{projectType}</p>
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
  const customListClass =
    "text-sm before:inline-block before:pr-1 before:align-top before:text-[16px] before:content-['•']";
  return (
    <div className="flex h-full w-full max-w-[dvw] grow flex-col items-center gap-4">
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
      <div className="flex w-full flex-col items-start gap-8 sm:flex-row">
        <div className="flex w-full min-w-44 justify-between sm:w-fit">
          <div className="flex w-fit flex-col gap-2 text-nowrap">
            <div className="w-fit bg-stone-400 px-3 py-1">
              <p className="text-xxs font-extrabold uppercase tracking-widest text-white">
                {props.category}
              </p>
            </div>
            <h4>&quot;{props.title}&quot;</h4>
          </div>
          <div className="flex sm:hidden">
            <Summary
              role={props.role}
              timeline={props.timeline}
              projectType={props.projectType}
            />
          </div>
        </div>
        <div className="flex w-full flex-col gap-4 lg:flex-row lg:gap-8">
          <p className="w-full max-w-[420px] text-sm">{props.summary}</p>
          <div className="flex w-full gap-4">
            <div className="flex w-full flex-col gap-2">
              <p className="text-xxs font-extrabold uppercase tracking-widest text-stone-400">
                ABOUT
              </p>
              <p className="text-sm">{props.about}</p>
            </div>
            <div className="flex w-full flex-col gap-2">
              <p className="text-xxs font-extrabold uppercase tracking-widest text-stone-400">
                FOCUS
              </p>
              <ul className="ml-1 flex list-inside list-none flex-col gap-0.5">
                {props.focus.map((item, index) => (
                  <li key={index} className={`${customListClass}`}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex">
          <Summary
            role={props.role}
            timeline={props.timeline}
            projectType={props.projectType}
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
