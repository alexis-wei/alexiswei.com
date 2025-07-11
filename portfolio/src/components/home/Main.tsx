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
}: {
  companyName: string;
  title: string;
  date: string;
  description: string;
}) => {
  return (
    <AccordionItem value={companyName}>
      <AccordionTrigger className="pr-2">
        <div className="grid w-full grid-cols-7 items-baseline px-2 font-sans">
          <p className="col-span-3 text-xs font-semibold">{title}</p>
          <p className="col-span-3 text-xs font-semibold">{companyName}</p>
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
    <div className="text-royal flex h-dvh w-dvw justify-start bg-white">
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
              className="border-royal max-w-full border-b border-t sm:w-[520px]"
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
              />
              <Experience
                companyName="Viam Robotics"
                title="Full Stack Software Engineer"
                date="2022-2023"
                description="Machine learning platform from camera and sensor data [Javascript, Go, GCS, MongoDB]"
              />
              <Experience
                companyName="Corner"
                title="Founding Engineer"
                date="2019-2022"
                description="Connecting you with the places around you"
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
