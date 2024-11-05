"use client";
import { FC, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

const Summary = () => {
  return (
    <div className="flex w-fit min-w-36 flex-col items-end gap-0.5 text-nowrap">
      <p className="text-sm italic">a bit of everything</p>
      <p className="text-sm">jan-apr 2024</p>
      <p className="text-sm font-bold">mobile web app</p>
    </div>
  );
};

const TheDrop: FC = () => {
  const containerRef = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const customListClass =
    "text-sm before:inline-block before:pr-1 before:align-top before:text-[16px] before:content-['•']";

  // Track scroll progress relative to the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scale = useTransform(
    scrollYProgress,
    [
      0,
      1, // End scale
    ],
    [0.5, 1],
  );

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  // Add this useEffect to monitor scrollYProgress
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (value) => {
      console.log("Scroll Progress:", value);
    });

    return () => unsubscribe();
  }, [scrollYProgress]);
  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full max-w-[dvw] grow flex-col items-center gap-4 p-5"
    >
      <div className="flex h-[50dvw] min-h-72 w-full items-center justify-center bg-[#FFD218] md:h-96">
        <div className="h-fit">
          <Image
            src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/thedrop-logo.png"
            width={60}
            height={36}
            alt="the drop logo"
          />
        </div>
      </div>
      <div className="flex w-full flex-col items-start gap-8 sm:flex-row">
        <div className="flex w-full min-w-36 justify-between sm:w-fit">
          <div className="flex w-fit flex-col gap-2 text-nowrap">
            <div className="w-fit bg-stone-400 px-3 py-1">
              <p className="text-xxs font-extrabold uppercase text-white">
                0 &nbsp;&#x2192; 1 &nbsp;product
              </p>
            </div>
            <h4>"the drop"</h4>
          </div>
          <div className="flex sm:hidden">
            <Summary />
          </div>
        </div>
        <div className="flex w-full flex-col gap-4 lg:flex-row lg:gap-8">
          <p className="w-full max-w-96 text-sm">
            I started working on the drop when it was just a basic MVP figma
            prototype with 0 lines of code. Over the next 3 months, my
            co-founders and I built out the platform, onboarded 20+ sellers,
            conducted &gt;$30k of transactions on our platform and was a part of
            the microsoft startup program. As the sole designer & engineer, I
            worked on landing pages, seller dashboards, individual components,
            and anything you can think of, truly bring the product to life from
            0 &#x2192; 1
          </p>
          <div className="flex w-full gap-4">
            <div className="flex w-full flex-col gap-2">
              <p className="text-xxs font-extrabold uppercase tracking-wider text-stone-400">
                ABOUT
              </p>
              <p className="text-sm">
                a video based shoppable link in bio – think simplified shopify
                made for sellers on social media
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              <p className="text-xxs font-extrabold uppercase tracking-wider text-stone-400">
                FOCUS
              </p>
              <ul className="ml-1 flex list-inside list-none flex-col gap-0.5">
                <li className={`${customListClass}`}>
                  in-app browser experience (Instagram entry)
                </li>
                <li className={`${customListClass}`}>mobile-first</li>
                <li className={`${customListClass}`}>fast and simple</li>
                <li className={`${customListClass}`}>
                  prioritizing content (video)
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex">
          <Summary />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="flex w-full flex-col items-start gap-4"
      >
        <div className="flex w-full flex-col items-start gap-1">
          <h4>landing page</h4>
          <p className="text-sm">key messaging: </p>
          <ul className="ml-1 flex list-inside list-none flex-col gap-0.5">
            <li className={`${customListClass} before:pr-2`}>
              fun, energetic and lively
            </li>
            <li className={`${customListClass} before:pr-2`}>
              <u>the</u> platform for sellers of one-of-a-kind goods
            </li>
            <li className={`${customListClass} before:pr-2`}>
              fast and simple
            </li>
            <li className={`${customListClass} before:pr-2`}>
              prioritizing content (video)
            </li>
          </ul>
        </div>
        <p className="max-w-[600px] text-sm">
          this is ultimately a page for the sellers, to convince them to join
          and choose “the drop” as their platform and link in bio of choice.
          These points acted as primary building blocks during design
        </p>
      </motion.div>
      <div className="max-w-dvw relative flex h-full w-full justify-between lg:max-w-[1000px]">
        <div className="w-1/6] absolute left-0 top-0 z-10 h-full bg-gradient-to-r from-white to-transparent"></div>
        <div className="absolute right-0 top-0 z-10 h-full w-1/6 bg-gradient-to-l from-white to-transparent"></div>
        <div className="flex w-full shrink-0 items-center gap-8 overflow-x-scroll lg:max-w-[1000px]">
          <motion.div
            className="flex h-fit w-72 shrink-0 flex-col items-center gap-2 rounded-xl p-5 shadow-sm"
            style={{ scale }}
          >
            <Image
              src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/landing-collage.png"
              alt="collage"
              width={220}
              height={400}
            />

            <p className="text-xxs text-center text-stone-600">
              created a fun graphic putting together sellers that our team
              admires, the kind of creatives we hope to attract to our platform
            </p>
          </motion.div>
          <motion.div className="flex h-fit w-72 shrink-0 flex-col items-center gap-2 rounded-xl p-5 shadow-sm">
            <video width="220" height="auto" ref={videoRef} playsInline muted>
              <source
                src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/first-video.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>

            <p className="text-xxs px-6 text-center text-stone-600">
              immediate clear focus on vintage sellers who want to sell from
              their social media
            </p>
          </motion.div>
          <motion.div className="flex h-fit w-72 shrink-0 flex-col items-center gap-2 rounded-xl p-5 shadow-sm">
            <Image
              src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/sticky.png"
              alt="collage"
              width={220}
              height={400}
            />

            <p className="text-xxs text-center text-stone-600">
              button sticky on bottom for constant visibility and reminder
            </p>
          </motion.div>
          <motion.div className="flex h-fit w-72 shrink-0 flex-col items-center gap-2 rounded-xl p-5 shadow-sm">
            <video width="220" height="auto" playsInline muted>
              <source
                src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/drop%20countdown.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>

            <p className="text-xxs px-6 text-center text-stone-600">
              active countdown showcasing the same excitement that your buyers
              would have during a drop moment
            </p>
          </motion.div>
        </div>
      </div>
      <div className="flex w-full flex-col items-start gap-4">
        <div className="flex w-full flex-col items-start gap-1">
          <h4>seller dashboard</h4>
          <p className="max-w-[600px] text-sm">
            not something particularly sexy, but something we know sellers have
            to interact with on a daily basis to track what’s going on. The two
            key design goals were to be <u>clear</u> and <u>informative</u>.
          </p>
        </div>
        <p className="max-w-[600px] text-sm">
          this started off extremely scrappy with bare minimum features at
          launch, but is a place where we actively listened to client feedback
          to understand what they needed for it to work well for them. The v0 we
          started with vs. 2 months later was truly night and day.
        </p>
        <p className="max-w-[600px] text-sm">
          the dashboard actually prioritized a desktop first format since
          sellers were more comfortable dealing with payments and tracking
          logistics through their laptops. We were really able to shine here for
          older audiences who found the platform straight forward and easy to
          navigate.
        </p>
      </div>
      <div className="flex w-full flex-col items-start gap-4">
        <div className="flex w-full flex-col items-start gap-1">
          <h4>storefront</h4>
          <p className="max-w-[600px] text-sm">
            beyond having a UX with good media load speed and a simple checkout
            process, this the place where we experimented the most with
            UI—knowing with each new store and drop, we had a new opportunity to
            test new experiences with fresh eyes.
          </p>
        </div>
        <div className="flex w-full flex-col items-start gap-1">
          <p className="text-sm">some ideas that we played with: </p>
          <ul className="ml-1 flex list-inside list-none flex-col gap-0.5">
            <li className={`${customListClass} before:pr-2`}>email catcher</li>
            <li className={`${customListClass} before:pr-2`}>discovery page</li>
            <li className={`${customListClass} before:pr-2`}>
              entry transition
            </li>
            <li className={`${customListClass} before:pr-2`}>intro video</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TheDrop;
