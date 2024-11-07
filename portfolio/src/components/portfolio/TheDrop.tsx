"use client";
import { FC, useRef } from "react";
import { motion } from "framer-motion";
import Highlight from "./Highlight";
import Image from "next/image";
import Header, { HeaderProps } from "./Header";

const TheDrop: FC = () => {
  const containerRef = useRef(null);

  const customListClass =
    "text-sm before:inline-block before:pr-1 before:align-top before:text-[16px] before:content-['•']";

  // const { scrollYProgress } = useScroll({
  //   target: containerRef,
  //   offset: ["start start", "end end"],
  // });

  // useEffect(() => {
  //   const unsubscribe = scrollYProgress.on("change", (value) => {
  //     console.log("Scroll Progress:", value);
  //   });

  //   return () => unsubscribe();
  // }, [scrollYProgress]);

  const theDropHeaderProps: HeaderProps = {
    logoSrc:
      "https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/thedrop-logo.png",
    category: "0   →   1 product",
    title: "the drop",
    bgColor: "#FFD218",
    summary:
      "I started working on the drop when it was just a basic MVP figma prototype with 0 lines of code. Over the next 3 months, my co-founders and I built out the platform, onboarded 20+ sellers, conducted >$30k of transactions on our platform and was a part of the microsoft startup program. As the sole designer & engineer, my work consisted of landing pages, seller dashboards, component design, and anything you can think of, truly bring the product to life from 0 → 1",
    about:
      "a video based shoppable link in bio – think simplified shopify made for sellers on social media",
    focus: [
      "in-app browser experience (Instagram entry)",
      "mobile-first",
      "fast and simple",
      "prioritizing content (video)",
    ],
    role: "a bit of everything",
    timeline: "3 months",
    projectType: "mobile web app",
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full max-w-[dvw] grow flex-col items-center gap-4 p-5 pb-40 font-sans md:gap-8"
    >
      <Header {...theDropHeaderProps} />

      <div className="flex w-full max-w-[1200px] flex-col items-center gap-8 p-5 md:gap-16">
        <motion.div className="flex w-full flex-col items-start gap-4">
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
        <div className="max-w-dvw relative flex h-full w-full justify-between overflow-hidden lg:max-w-[1000px]">
          <div className="absolute left-0 top-0 z-10 h-full w-1/6 bg-gradient-to-r from-white to-transparent"></div>
          <div className="absolute right-0 top-0 z-10 h-full w-1/6 bg-gradient-to-l from-white to-transparent"></div>
          <div className="flex w-full shrink-0 items-center gap-8 overflow-x-scroll px-[14dvw] lg:max-w-[1000px]">
            <Highlight
              type="image"
              src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/landing-collage.png"
              description="created a fun graphic putting together sellers that our team
                admires, the kind of creatives we hope to attract to our platform"
              alt="collage"
            />
            <Highlight
              type="video"
              src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/first-video.mp4"
              description="immediate clear focus on vintage sellers who want to sell from
                their social media"
              alt="landing page first screen"
            />
            <Highlight
              type="image"
              src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/sticky.png"
              description="button sticky on bottom for constant visibility and reminder"
              alt="sticky button on bottom desc"
            />
            <Highlight
              type="video"
              src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/drop%20countdown.mp4"
              description="active countdown showcasing the same excitement that your buyers
                would have during a drop moment"
              alt="landing page first screen"
            />
          </div>
        </div>
        <div className="flex w-full flex-col justify-center gap-8">
          <div className="flex w-full flex-col items-start gap-4">
            <div className="flex w-full flex-col items-start gap-1">
              <h4>seller dashboard</h4>
              <p className="max-w-[600px] text-sm">
                not something particularly sexy, but something we know sellers
                have to interact with on a daily basis to track what’s going on.
                The two key design goals were to be <u>clear</u> and{" "}
                <u>informative</u>.
              </p>
            </div>
            <p className="max-w-[600px] text-sm">
              this started off extremely scrappy with bare minimum features at
              launch, but is a place where we actively listened to client
              feedback to understand what they needed for it to work well for
              them. The v0 we started with vs. 2 months later was truly night
              and day.
            </p>
            <p className="max-w-[600px] text-sm">
              the dashboard actually prioritized a desktop first format since
              sellers were more comfortable dealing with payments and tracking
              logistics through their laptops. We were really able to shine here
              for older audiences who found the platform straight forward and
              easy to navigate.
            </p>
          </div>
          <div className="flex w-full snap-x snap-mandatory overflow-x-auto pb-12">
            <div className="flex min-w-full grow snap-center flex-col items-center justify-center gap-2 px-4 md:flex-row">
              <div className="flex h-fit w-full justify-center md:justify-end">
                <div className="relative h-[136px] w-[220px]">
                  <Image
                    src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/payment%20original.png"
                    alt="origin payments section"
                    sizes="220px"
                    fill
                    className="object-fit"
                  />
                </div>
              </div>
              <IconHeroiconsArrowRight className="hidden shrink-0 md:flex" />
              <IconHeroiconsArrowDown className="shrink-0 md:hidden" />
              <div className="relative flex w-full items-center justify-center overflow-visible md:justify-start">
                <div className="relative h-[208px] w-[220px] sm:h-[286px] sm:w-[300px]">
                  <Image
                    src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/payment%20improved.png"
                    alt="updated payments section"
                    sizes="300px"
                    fill
                    className="object-fit"
                  />
                </div>
                <div className="absolute w-[168px] -translate-y-[76px] translate-x-[88px] rounded bg-[#FEF8E8] px-3 py-2 shadow sm:-translate-y-[100px] sm:translate-x-[84px] md:translate-x-[164px]">
                  <p className="text-xxs">
                    clear account balance shown directly on dashboard instead of
                    redirecting to Stripe
                  </p>
                </div>
                <div className="absolute w-[130px] -translate-y-[8px] translate-x-[120px] rounded bg-[#FEF8E8] px-3 py-2 shadow sm:translate-x-[170px] sm:translate-y-[50px] md:translate-x-[260px]">
                  <p className="text-xxs">
                    info banner after sellers were confused about payout delays
                  </p>
                </div>
                <div className="absolute w-[220px] -translate-x-[40px] translate-y-[128px] rounded bg-[#FEF8E8] px-3 py-2 shadow sm:-translate-x-[124px] sm:translate-y-[160px] md:-translate-x-[40px]">
                  <p className="text-xxs">
                    directly able to get payout on seller side instead of
                    needing to be triggered from our end
                  </p>
                </div>
              </div>
            </div>
            <div className="flex min-w-full grow snap-center flex-col items-center justify-center gap-2 px-4 md:flex-row">
              <div className="w-fit">
                <div className="relative h-[258px] w-[220px]">
                  <Image
                    src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/drop%20original.png"
                    alt="original drops section"
                    sizes="220px"
                    fill
                    className="object-fit"
                  />
                </div>
              </div>
              <IconHeroiconsArrowRight />
              <div className="w-fit">
                <div className="relative h-[258px] w-[220px]">
                  <Image
                    src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/drops_improved.png"
                    alt="updated drops section"
                    sizes="220px"
                    fill
                    className="object-fit"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex w-full flex-col items-start gap-4">
            <div className="flex w-full flex-col items-start gap-1">
              <h4>storefront</h4>
              <p className="max-w-[600px] text-sm">
                beyond having a UX with good media load speed and a simple
                checkout process, this is the place where we experimented the
                most with UI—knowing with each new store and drop, we had a new
                opportunity to test new experiences with fresh eyes.
              </p>
            </div>
            <div className="flex w-full flex-col items-start gap-1">
              <p className="text-sm">some ideas that we played with: </p>
              <ul className="ml-1 flex list-inside list-none flex-col gap-0.5">
                <li className={`${customListClass} before:pr-2`}>
                  email catcher
                </li>
                <li className={`${customListClass} before:pr-2`}>
                  discovery page
                </li>
                <li className={`${customListClass} before:pr-2`}>
                  entry transition
                </li>
                <li className={`${customListClass} before:pr-2`}>
                  intro video
                </li>
              </ul>
            </div>
          </div>
          <div className="max-w-dvw relative flex h-full w-full justify-between overflow-hidden lg:max-w-[1000px]">
            <div className="absolute left-0 top-0 z-10 h-full w-1/6 bg-gradient-to-r from-white to-transparent"></div>
            <div className="absolute right-0 top-0 z-10 h-full w-1/6 bg-gradient-to-l from-white to-transparent"></div>
            <div className="flex w-full shrink-0 items-center gap-8 overflow-x-scroll px-[10dvw] lg:max-w-[1000px]">
              <Highlight
                type="image"
                src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/email%20catcher.png"
                description="worked so surprisingly well, unexpectedly our best performing feature"
                alt="email catcher"
              />
              <Highlight
                type="video"
                src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/discover-short.mp4"
                description="with a goal for buyers to discover other similar sellers and see if there was the possiblity of cross pollination"
                alt="discover page"
              />
              <Highlight
                type="video"
                src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/transition.mp4"
                description="initial transition on store load for a smooth entry experience"
                alt="landing page first screen"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheDrop;
