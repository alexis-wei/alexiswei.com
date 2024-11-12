"use client";

import { FC } from "react";
import Header, { HeaderProps } from "./Header";
import Image from "next/image";
import { motion } from "framer-motion";

const Spotlight: FC = () => {
  const spotlightHeaderProps: HeaderProps = {
    logoSrc:
      "https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/spotlight/lamp-sticker.png",
    category: "branding",
    title: "spotlight hacks",
    bgColor: "#DFEAEA",
    summary: `a partnership with Entrepreneur First, a leading global accelerator,
      to create brand designs for a series of hackathons to run throughout the year.
      I got to develop the designs from scratch, from the name of the event & logo
      to social media posts & merch ideas. with a goal for this to be a series to
      be remembered in the european technology startup space.`,
    about:
      "a series of hackathons hosted by Entrepreneur First, each with a different theme (hardware, consumer, gaming, etc)",
    focus: [
      "naming and concept",
      "reusable and recognizable logo",
      "appeal to a wide range of engineers",
    ],
    role: "logo + social media",
    timeline: "1 week",
    projectType: "event branding",
  };

  return (
    <div className="md: relative flex h-full w-full max-w-[dvw] grow flex-col items-center gap-4 p-5 pb-40 font-sans lg:gap-8">
      <Header {...spotlightHeaderProps} />
      <div className="flex w-full max-w-[1200px] flex-col items-center gap-10 md:gap-16 md:p-5">
        <div className="flex w-full flex-col items-start gap-10 lg:flex-row">
          <div className="flex w-full flex-col items-start gap-1">
            <h4>conceptualization</h4>
            <div className="flex flex-col gap-4">
              <p className="max-w-[600px] text-sm md:text-base">
                as an engineer, what you often care the most about are the tools
                you are building with and who you are building for. Keeping in
                mind that with each hackathon, there&apos;s a different focus,
                new technologies to interact with, with an audience of varying
                interests, it&apos;s key to keep the core concept relevant, but
                showcases the differences.
              </p>
              <p className="max-w-[600px] text-sm md:text-base">
                zooming into this idea of <u>focus</u>, what better way is there
                to put attention on something than to shine a literal spotlight
                over them? they are the star, the topic of discussion, and what
                the audience is here for.
              </p>
              <p className="max-w-[600px] text-sm md:text-base">
                the idea and name of &quot;spotlight&quot; stood out. simple yet
                customizable for each event
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-1">
            <h4>typography</h4>
            <div className="flex gap-4">
              <div className="flex flex-col">
                <div className="relative h-[100px] w-[100px]">
                  <Image
                    src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/spotlight/press_start_2p.jpg"
                    sizes="100"
                    alt="press play 2p font"
                    fill
                    className="object-fit"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold md:text-base">
                    press start 2p
                  </span>
                  <span className="text-sm text-stone-600 md:text-base">
                    regular
                  </span>
                  <span className="text-sm text-stone-600 md:text-base">
                    uppercase -7%
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <p className="max-w-[600px] text-sm md:text-base">
                  press start 2p was chosen as the title font—it is a bitmap
                  font inspired by 1980s arcade games.
                </p>
                <p className="max-w-[600px] text-sm md:text-base">
                  I wanted this series of hackathons to be more than just a
                  place to try out new technology. hackathons are spaces to
                  combine technology and community, to meet new people and bond
                  over shared interests. arcade games are perfect the
                  intersection of these concepts, while being something many
                  engineers can find familiarity and comfort in.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-8 md:gap-4">
          <div className="flex w-full flex-col items-start gap-1">
            <h4>final assets</h4>
            <p className="max-w-[600px] text-sm md:text-base">
              branding + hackathon #1 — focused on consumer technology on AI
              models on embedded devices.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 overflow-visible">
            <motion.div
              initial={{ x: -240 }}
              whileInView={{ x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
              className="flex w-fit flex-wrap items-center justify-center gap-4"
            >
              <div className="flex flex-col items-center justify-center gap-4 border border-stone-300 p-4 shadow-md md:w-fit">
                <div className="flex w-full gap-2 md:w-fit">
                  <div className="relative aspect-square w-full md:min-w-[240px]">
                    <Image
                      src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/spotlight/sponsor_announce_meta.jpg"
                      fill
                      alt="sponsor meta"
                      sizes="(max-width: 640px) 30vw, 240px"
                      className="object-fit"
                    />
                  </div>
                  <div className="relative aspect-square w-full md:min-w-[240px]">
                    <Image
                      src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/spotlight/sponsor_announce_hugging_face.jpg"
                      fill
                      alt="sponsor hugging face"
                      sizes="(max-width: 640px) 30vw, 240px"
                      className="object-fit"
                    />
                  </div>
                  <div className="relative aspect-square w-full md:min-w-[240px]">
                    <Image
                      src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/spotlight/sponsor_announce_scaleway.jpg"
                      fill
                      alt="sponsor scaleway"
                      sizes="(max-width: 640px) 30vw, 240px"
                      className="object-fit"
                    />
                  </div>
                </div>
                <p className="text-xs text-stone-500 md:text-sm">
                  sponsor announcement posts
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-4 border border-stone-300 p-4 shadow-md sm:w-fit">
                <div className="relative aspect-square w-full sm:w-[240px]">
                  <Image
                    src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/spotlight/announcement_v2.jpg"
                    fill
                    alt="event announcement"
                    sizes=" 240px"
                    className="object-fit"
                  />
                </div>
                <p className="text-xs text-stone-500 md:text-sm">
                  announcement v2
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ x: 240 }}
              viewport={{ once: true }}
              whileInView={{ x: 0 }}
              transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
              className="flex w-full flex-wrap items-center justify-center gap-4"
            >
              <div className="flex w-[90dvw] max-w-[320px] flex-col items-center justify-center gap-4 border border-stone-300 p-4 shadow-md sm:w-fit">
                <div className="relative aspect-[7/10] h-[393px] w-auto">
                  <Image
                    src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/spotlight/sticker_sheet.jpg"
                    fill
                    alt="sticker sheet"
                    sizes="400px"
                    className="object-fit"
                  />
                </div>
                <p className="text-xs text-stone-500 md:text-sm">
                  sticker sheet
                </p>
              </div>
              <div className="flex w-[90dvw] flex-col items-center justify-center gap-4 border border-stone-300 p-4 shadow-md md:w-fit">
                <div className="relative aspect-video h-auto w-full md:h-[393px] md:w-fit">
                  <Image
                    src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/spotlight/horizontal.jpg"
                    fill
                    alt="horizontal banner"
                    sizes="400px"
                    className="object-fit"
                  />
                </div>
                <p className="text-xs text-stone-500 md:text-sm">
                  horizontal banner for social media
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spotlight;
