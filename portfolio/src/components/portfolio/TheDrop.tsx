"use client";
import { FC, useRef, useState } from "react";
import { motion } from "framer-motion";
import Highlight from "./Highlight";
import Image from "next/image";
import Header, { HeaderProps } from "./Header";

const TheDrop: FC = () => {
  const containerRef = useRef(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dashboardCarouselCard, setDashboardCarouselCard] = useState(1);
  const [dashboardCarouselScroll, setDashboardCarouselScroll] = useState(1);

  const customListClass =
    "text-sm before:inline-block before:pr-1 before:align-top before:text-[16px] before:content-['•'] md:text-base";

  const theDropHeaderProps: HeaderProps = {
    logoSrc:
      "https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/thedrop-logo.png",
    category: "0   →   1 product",
    title: "the drop",
    bgColor: "#FFD218",
    summary: `I started working on the drop when it was a basic figma prototype. 
    I designed & built out the platform over the next 3 months. We onboarded 20+ sellers, 
    conducted >$30k of transactions and was a part of the microsoft startup program. My work consisted of landing pages, 
    seller dashboards, component design, and anything you can think of, bring the product from 0 → 1`,
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

  const handleScroll = () => {
    if (!carouselRef.current) return;

    const scrollLeft = carouselRef.current.scrollLeft;
    const slideWidth = carouselRef.current.clientWidth;

    const currentCard = Math.round(scrollLeft / slideWidth);

    const transitionVal = (slideWidth * 2) / 5;
    const opacity = calculateOpacity(slideWidth, transitionVal, scrollLeft);
    console.log("opacity:", opacity);
    setDashboardCarouselScroll(opacity);

    setDashboardCarouselCard(currentCard);
  };

  const calculateOpacity = (
    slideWidth: number,
    transitionVal: number,
    xPos: number,
  ) => {
    if (xPos < transitionVal) return 1;
    else if (xPos > slideWidth - transitionVal) return 0;
    else {
      return 1 - (xPos - transitionVal) / (slideWidth - transitionVal);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full max-w-[dvw] grow flex-col items-center gap-4 p-5 pb-40 font-sans md:gap-8"
    >
      <Header {...theDropHeaderProps} />

      <div className="flex w-full max-w-[1200px] flex-col items-center gap-10 md:gap-16 md:p-5">
        <motion.div className="flex w-full flex-col items-start gap-4">
          <div className="flex w-full flex-col items-start gap-1">
            <h4>landing page</h4>
            <p className="text-sm md:text-base">key messaging: </p>
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
          <p className="max-w-[600px] text-sm md:text-base">
            this is ultimately a page for the sellers, to convince them to join
            and choose “the drop” as their platform and link in bio of choice.
            These points acted as primary building blocks during design
          </p>
        </motion.div>

        <div className="no-scrollbar w-full overflow-x-scroll py-4">
          <div className="flex h-full w-fit items-center gap-8 pl-[1px]">
            <Highlight
              type="image"
              src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/landing-collage.png"
              subheading="creative graphics"
              description="fill with sellers that our team
                  admires, the kind of creatives we hope to attract to our platform"
              alt="collage"
            />
            <Highlight
              type="video"
              src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/first-video.mp4"
              subheading="focused landing"
              description="immediate clear focus on vintage sellers who want to sell from
                  their social media"
              alt="landing page first screen"
            />
            <Highlight
              type="image"
              src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/sticky.png"
              subheading="considerate CTA"
              description="button sticky on bottom for constant visibility and reminder"
              alt="sticky button on bottom desc"
            />
            <Highlight
              type="video"
              src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/drop%20countdown.mp4"
              subheading="fun animation"
              description="active countdown showcasing bringing the energy and excitment of a drop"
              alt="landing page first screen"
            />
          </div>
        </div>

        <div className="flex w-full flex-col justify-center gap-8">
          <div className="flex w-full flex-col items-start gap-4">
            <div className="flex w-full flex-col items-start gap-1">
              <h4>seller dashboard</h4>
              <p className="max-w-[600px] text-sm md:text-base">
                not something particularly sexy, but something we know sellers
                have to interact with on a daily basis to track what’s going on.
                The two key design goals were to be <u>clear</u> and{" "}
                <u>informative</u>.
              </p>
            </div>
            <p className="max-w-[600px] text-sm md:text-base">
              this started off extremely scrappy with bare minimum features at
              launch, but is a place where we actively listened to client
              feedback to understand what they needed for it to work well for
              them. The v0 we started with vs. 2 months later was truly night
              and day.
            </p>
            <p className="max-w-[600px] text-sm md:text-base">
              the dashboard actually prioritized a desktop first format since
              sellers were more comfortable dealing with payments and tracking
              logistics through their laptops. We were really able to shine here
              for older audiences who found the platform straight forward and
              easy to navigate.
            </p>
          </div>
          <div className="flex h-full min-w-full grow snap-center flex-col items-center justify-center border-4 border-[#FFD218] lg:h-[520px] lg:flex-row">
            <div className="relative flex h-full w-full items-center justify-center bg-[#FFD218] px-8 py-24 lg:w-[680px]">
              <span className="absolute top-8 font-bold uppercase tracking-widest text-black">
                ELEMENT
              </span>

              <div
                className="no-scrollbar relative flex snap-x snap-mandatory flex-row overflow-scroll scroll-smooth"
                ref={carouselRef}
                onScroll={handleScroll}
              >
                <motion.div
                  animate={{
                    opacity: dashboardCarouselScroll,
                  }}
                  transition={{
                    opacity: { duration: 0.7, delay: 0.1 },
                  }}
                  className="flex min-w-full snap-center flex-col items-center justify-center gap-2 md:flex-row md:px-12"
                >
                  <div className="flex h-fit w-full justify-center md:justify-end">
                    <div className="relative h-[136px] w-[220px]">
                      <Image
                        src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/payment%20original.png"
                        alt="origin payments section"
                        sizes="220px"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <IconHeroiconsArrowRight className="hidden shrink-0 md:flex" />
                  <IconHeroiconsArrowDown className="shrink-0 md:hidden" />
                  <div className="relative flex w-full items-center justify-center overflow-visible md:justify-start">
                    <div className="relative h-[286px] w-[300px]">
                      <Image
                        src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/payment%20improved.png"
                        alt="updated payments section"
                        sizes="300px"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ opacity: 1 - dashboardCarouselScroll }}
                  transition={{
                    opacity: { duration: 0.7, delay: 0.1 },
                  }}
                  className="flex min-w-full snap-center flex-col items-center justify-center gap-2 md:flex-row md:px-12"
                >
                  <div className="relative h-[258px] w-[220px] sm:h-[286px] sm:w-[240px]">
                    <Image
                      src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/drop%20original.png"
                      alt="original drops section"
                      sizes="220px"
                      fill
                      className="object-contain"
                    />
                  </div>

                  <IconHeroiconsArrowRight className="hidden shrink-0 md:flex" />
                  <IconHeroiconsArrowDown className="shrink-0 md:hidden" />
                  <div className="w-fit">
                    <div className="relative h-[258px] w-[220px] sm:h-[286px] sm:w-[240px]">
                      <Image
                        src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/drops_improved.png"
                        alt="updated drops section"
                        sizes="220px"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="absolute bottom-8 flex h-[28px] w-fit gap-2 rounded-full bg-black bg-opacity-70 px-4 py-3">
                <div
                  className={`h-1 rounded-full bg-white transition-all duration-700 ease-out ${dashboardCarouselCard === 0 ? "w-8" : "w-1"}`}
                ></div>
                <div
                  className={`h-1 rounded-full bg-white transition-all duration-700 ease-out ${dashboardCarouselCard === 0 ? "w-1" : "w-8"}`}
                ></div>
              </div>
            </div>
            <div className="relative flex h-full w-full flex-col items-center justify-center px-8 pb-16 pt-24">
              <span className="absolute top-8 font-bold uppercase tracking-widest text-black">
                IMPROVEMENTS
              </span>
              {dashboardCarouselCard === 0 ? (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-black">
                      <span className="text-center font-serif text-xs font-bold italic text-white">
                        1.
                      </span>
                    </div>
                    <div className="max-w-96 border border-black bg-white p-4 shadow-[-6px_6px_0px_#FFD218]">
                      <p className="text-xs md:text-sm">
                        clear account balance shown directly on dashboard
                        instead of redirecting to Stripe
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-black">
                      <span className="text-center font-serif text-xs font-bold italic text-white">
                        2.
                      </span>
                    </div>
                    <div className="max-w-96 border border-black bg-white p-4 shadow-[-6px_6px_0px_#FFD218]">
                      <p className="text-xs md:text-sm">
                        info banner after sellers were confused about payout
                        delays
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-black">
                      <span className="text-center font-serif text-xs font-bold italic text-white">
                        3.
                      </span>
                    </div>
                    <div className="max-w-96 border border-black bg-white p-4 shadow-[-6px_6px_0px_#FFD218]">
                      <p className="text-xs md:text-sm">
                        directly able to get payout on seller side instead of
                        needing to be triggered from our end
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-black">
                      <span className="text-center font-serif text-xs font-bold italic text-white">
                        1.
                      </span>
                    </div>
                    <div className="max-w-96 border border-black bg-white p-4 shadow-[-6px_6px_0px_#FFD218]">
                      <p className="text-xs md:text-sm">
                        ability to add new drop directly from dashboard instead
                        of having to contact us to add it manually
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-black">
                      <span className="text-center font-serif text-xs font-bold italic text-white">
                        2.
                      </span>
                    </div>
                    <div className="max-w-96 border border-black bg-white p-4 shadow-[-6px_6px_0px_#FFD218]">
                      <p className="text-xs md:text-sm">
                        all drops viewable rather than just information about
                        the singel latest drop set up
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-black">
                      <span className="text-center font-serif text-xs font-bold italic text-white">
                        3.
                      </span>
                    </div>
                    <div className="max-w-96 border border-black bg-white p-4 shadow-[-6px_6px_0px_#FFD218]">
                      <p className="text-xs md:text-sm">
                        image preview so sellers can tell what items have
                        already been uploaded, differentiating between drops
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex w-full flex-col items-start gap-4">
            <div className="flex w-full flex-col items-start gap-1">
              <h4>storefront</h4>
              <p className="max-w-[600px] text-sm md:text-base">
                beyond having a UX with good media load speed and a simple
                checkout process, this is the place where we experimented the
                most with UI—knowing with each new store and drop, we had a new
                opportunity to test new experiences with fresh eyes.
              </p>
            </div>
            <div className="flex w-full flex-col items-start gap-1">
              <p className="text-sm md:text-base">
                some ideas that we played with:{" "}
              </p>
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

          <div className="no-scrollbar w-full overflow-x-scroll py-4">
            <div className="flex h-full w-fit items-center gap-8 pl-[1px]">
              <Highlight
                type="image"
                src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/email%20catcher.png"
                subheading="email catcher"
                description="helping sellers build an audience automatically, unexpectedly our best performing feature"
                alt="email catcher"
              />
              <Highlight
                type="video"
                src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/discover-short.mp4"
                subheading="discovery page"
                description="testing out the possiblity of cross pollination through discovery similar sellers"
                alt="discover page"
              />
              <Highlight
                type="video"
                src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/portfolio/the-drop/transition.mp4"
                subheading="entry transition"
                description="on store load for a smooth experience"
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
