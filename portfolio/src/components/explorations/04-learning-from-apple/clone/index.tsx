"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import styles from "./AppleClone.module.css";
import "./apple.css";

gsap.registerPlugin(ScrollTrigger);

export default function AppleClone() {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const imageRef = useRef(null);
  const backgroundRef = useRef(null);
  const playRef = useRef<HTMLDivElement>(null);
  const slideShowNavRef = useRef(null);

  const scrollContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const snapItems = document.querySelectorAll(".snap-start");

    // Set all initial states for animations here
    gsap.set([headlineRef.current], {
      opacity: 0,
      y: 30,
    });

    gsap.set([imageRef.current, backgroundRef.current], {
      opacity: 0,
      y: 20,
      scale: 0.9,
    });

    snapItems.forEach((item) => {
      const caption = item.querySelector("div.absolute p.apple-caption");
      gsap.set(caption, {
        opacity: 0,
        x: -20,
      });

      gsap.to(caption, {
        scrollTrigger: {
          trigger: item,
          start: "left center",
          scroller: scrollContainer.current,
          horizontal: true,
          // markers: true,
          toggleActions: "play none none reverse",
        },
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    });

    gsap.set([playRef.current], {
      opacity: 0,
      y: 10,
      x: 20,
    });

    gsap.set([slideShowNavRef.current], {
      opacity: 0,
      y: 10,
      x: -20,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 50%",
        end: "+=400",
        // markers: true,
      },
    });

    tl.to(headlineRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
    })
      .to(
        imageRef.current,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
        },
        "-=0.5",
      )
      .to(
        backgroundRef.current,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
        },
        "-=1",
      );

    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: scrollContainer.current,
        start: "center 50%",
        // markers: true,
        toggleActions: "play none none reverse",
      },
    });

    tl2.to([playRef.current, slideShowNavRef.current], {
      opacity: 1,
      y: 0,
      x: 0,
      duration: 0.5,
      ease: "power2.out",
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div
      className={`${styles.container} h-full min-h-dvh w-full bg-[#000] font-sans text-white`}
    >
      <section
        ref={sectionRef}
        className="relative h-dvh min-h-[1600px] w-full overflow-hidden"
      >
        <img
          ref={backgroundRef}
          className="absolute left-1/2 flex w-full max-w-[1825px] -translate-x-1/2 items-center"
          src="/explorations/04-learning-from-apple/hero_startframe_xlarge.jpg"
          alt="herostart frame"
        />
        <div className="relative flex w-full flex-col items-center justify-center pt-72">
          <h1
            ref={headlineRef}
            className="apple-headline mb-[27px] mt-[17px] text-[28px] font-semibold opacity-90"
          >
            iPhone&nbsp;16&nbsp;Pro
          </h1>
          <h2 className="hidden">Hello, Apple Intelligence</h2>

          <div
            ref={imageRef}
            className="flex h-20 items-center justify-center overflow-visible"
          >
            <img
              src="/explorations/04-learning-from-apple/hero_apple_intelligence_headline_xlarge.png"
              alt="hello apple intelligence"
              className="shrink-0"
            />
          </div>
        </div>
      </section>
      <section className="relative flex h-full min-h-dvh flex-col items-center gap-12 overflow-hidden bg-neutral-800 py-40">
        <div className="w-full max-w-[1600px]">
          <h2 className="apple-headline text-6xl">Get the highlights.</h2>
        </div>

        <div
          ref={scrollContainer}
          className="margin no-scrollbar w-full snap-x snap-mandatory scroll-pl-[var(--media-padding)] overflow-x-scroll"
        >
          <ul className="media-left-padding relative grid h-[700px] w-max grid-flow-col gap-6 after:block after:w-[100vw]">
            <li className="relative flex h-full w-[1400px] snap-start overflow-hidden rounded-xl">
              <figure className="absolute inset-0">
                <video
                  src="/explorations/04-learning-from-apple/section2_xlarge_2x.mp4"
                  className="h-full w-full object-cover"
                ></video>
              </figure>
              <div className="absolute left-8 top-6">
                <p className="apple-caption w-80 text-2xl font-semibold">
                  the first iPhone built for Apple Intelligence. Personal,
                  private, powerful
                </p>
              </div>
            </li>
            <li className="relative flex h-full w-[1400px] snap-start overflow-hidden rounded-xl">
              <figure className="absolute inset-0">
                <video
                  src="/explorations/04-learning-from-apple/section2_xlarge_2x.mp4"
                  className="h-full w-full object-cover"
                ></video>
              </figure>
              <div className="absolute left-8 top-6">
                <p className="apple-caption w-80 text-2xl font-semibold">
                  the first iPhone built for Apple Intelligence. Personal,
                  private, powerful
                </p>
              </div>
            </li>
            <li className="relative flex h-full w-[1400px] snap-start overflow-hidden rounded-xl">
              <figure className="absolute inset-0">
                <video
                  src="/explorations/04-learning-from-apple/section2_xlarge_2x.mp4"
                  className="h-full w-full object-cover"
                ></video>
              </figure>
              <div className="absolute left-8 top-6">
                <p className="apple-caption w-80 text-2xl font-semibold">
                  the first iPhone built for Apple Intelligence. Personal,
                  private, powerful
                </p>
              </div>
            </li>
            <li className="relative flex h-full w-[1400px] snap-start overflow-hidden rounded-xl">
              <figure className="absolute inset-0">
                <video
                  src="/explorations/04-learning-from-apple/section2_xlarge_2x.mp4"
                  className="h-full w-full object-cover"
                ></video>
              </figure>
              <div className="absolute left-8 top-6">
                <p className="apple-caption w-80 text-2xl font-semibold">
                  the first iPhone built for Apple Intelligence. Personal,
                  private, powerful
                </p>
              </div>
            </li>
          </ul>
        </div>
        <div className="fixed bottom-8 left-1/2 flex -translate-x-1/2 gap-8">
          <div className="flex rounded-full bg-neutral-600 p-4" ref={playRef}>
            <IconHeroiconsPlay20Solid />
          </div>
          <div
            className="flex items-center rounded-full bg-neutral-600 px-6 py-4"
            ref={slideShowNavRef}
          >
            <ul className="m-0 flex gap-4">
              <li className="h-2 w-2 rounded-full bg-neutral-300">
                <a></a>
              </li>
              <li className="h-2 w-2 rounded-full bg-neutral-300">
                <a></a>
              </li>
              <li className="h-2 w-2 rounded-full bg-neutral-300">
                <a></a>
              </li>
              <li className="h-2 w-2 rounded-full bg-neutral-300">
                <a></a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
