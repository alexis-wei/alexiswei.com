"use client";

import SocialMedia from "@/lib/SocialMedia";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Experience = ({
  companyName,
  title,
  date,
  description,
  link,
}: {
  companyName: string;
  title: string;
  date: string;
  description: string;
  link?: string;
}) => {
  return (
    <AccordionItem value={companyName}>
      <AccordionTrigger className="pr-2">
        <div className="grid w-full grid-cols-7 items-baseline px-2 font-sans">
          <p className="col-span-3 text-xs font-semibold">{title}</p>
          <p className="col-span-3 text-xs font-semibold">
            {companyName}
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 inline-block"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="inline-block h-3 w-3"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            )}
          </p>
          <p className="text-right text-xs font-semibold">{date}</p>
        </div>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-4 text-wrap p-2">
        <p className="text-xs">{description}</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default function Main() {
  return (
    <div className="flex h-dvh w-dvw justify-start bg-white text-royal">
      <div className="flex flex-col items-start p-12">
        <h1 className="mb-4 font-serif text-3xl font-bold">alexis wei</h1>

        <div className="flex flex-col items-start gap-8">
          <div className="flex flex-col font-mono text-xs">
            <p>design engineer</p>
            <p>photographer</p>
            <p>creative</p>
          </div>

          <div className="flex flex-col gap-4">
            <Accordion
              type="single"
              collapsible
              defaultValue=""
              className="max-w-full border-b border-t border-royal sm:w-[520px]"
            >
              <Experience
                companyName="--"
                title="Exploring"
                date="Currently"
                description="Design engineering, 3D animation, art, content, yoga"
              />
              <Experience
                companyName="The Drop"
                title="Co-founder & CTO"
                date="2024"
                description="Built a video first link-in-bio shop for sellers on social media"
                link="https://thedrop.fun"
              />
              <Experience
                companyName="Viam Robotics"
                title="Full Stack Software Engineer"
                date="2022-2023"
                description="Machine learning platform from camera and sensor data [Javascript, Go, GCS, MongoDB]"
                link="https://www.viam.com"
              />
              <Experience
                companyName="Corner"
                title="Founding Engineer"
                date="2019-2022"
                description="Connecting you with the places around you"
                link="https://www.corner.inc"
              />
              <Experience
                companyName="Microsoft"
                title="Software Engineering Intern"
                date="2021"
                description="Azure blob storage"
              />
            </Accordion>
          </div>
          <SocialMedia />
        </div>
      </div>
    </div>
  );
}
