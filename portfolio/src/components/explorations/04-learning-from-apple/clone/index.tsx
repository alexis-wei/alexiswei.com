"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import styles from "./AppleClone.module.css";
import "./apple.css";
import { color } from "three/webgpu";

gsap.registerPlugin(ScrollTrigger);

export default function AppleClone() {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const imageRef = useRef(null);
  const backgroundRef = useRef(null);
  const playRef = useRef<HTMLDivElement>(null);
  const slideShowNavRef = useRef(null);
  const colorNavRef = useRef<HTMLDivElement>(null);

  const scrollContainer = useRef<HTMLDivElement>(null);
  const colorStyleContainer = useRef<HTMLDivElement>(null);
  const colorsImgRef = useRef(null);

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

    gsap.set(colorNavRef.current, {
      opacity: 0,
      y: 10,
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

    gsap.timeline({
      scrollTrigger: {
        trigger: scrollContainer.current,
        start: "center 100%",
        end: "center 0%",
        markers: true,
        // toggleActions: "play reverse play reverse",
        onEnter: () => {
          gsap.to([playRef.current, slideShowNavRef.current], {
            opacity: 1,
            y: 0,
            x: 0,
            duration: 0.5,
            ease: "power2.out",
          });
        },
        onLeave: () => {
          // Create a wiggle effect while morphing
          gsap.to([playRef.current, slideShowNavRef.current], {
            opacity: 0,
            scale: 0.9,
            x: "random(-5, 5)", // Small random x movement
            y: "random(-3, 3)", // Small random y movement
            rotation: "random(-5, 5)", // Slight rotation
            duration: 0.4,
            ease: "power1.inOut",
            onComplete: () => {
              gsap.fromTo(
                colorNavRef.current,
                {
                  opacity: 0,
                  scale: 0.9,
                  rotation: "random(-3, 3)",
                },
                {
                  opacity: 1,
                  scale: 1,
                  rotation: 0,
                  duration: 0.5,
                  ease: "elastic.out(1, 0.8)",
                },
              );
            },
          });
        },
        onEnterBack: () => {
          // Reverse with wiggle
          gsap.to(colorNavRef.current, {
            opacity: 0,
            scale: 0.9,
            rotation: "random(-5, 5)",
            duration: 0.3,
            ease: "power1.inOut",
            onComplete: () => {
              gsap.to([playRef.current, slideShowNavRef.current], {
                opacity: 1,
                scale: 1,
                rotation: 0,
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.8)",
              });
            },
          });
        },
      },
    });

    gsap.timeline({
      scrollTrigger: {
        trigger: scrollContainer.current,
        start: "center 100%",
        end: "center 0%",
        markers: true,
      },
    });

    // Create scroll-triggered reveal animation for color styles
    const colorStylesTl = gsap.timeline({
      scrollTrigger: {
        trigger: colorStyleContainer.current,
        start: "top top",
        end: "+=300%", // Makes the animation last for 3 full viewport heights
        pin: true, // Pins the container
        scrub: 1, // Smooth scrolling animation
        // markers: true, // Helpful for debugging
      },
    });

    const firstLayer = colorStyleContainer.current?.children[0] as HTMLElement;
    const secondLayer = colorStyleContainer.current?.children[1] as HTMLElement;

    gsap.set([firstLayer, secondLayer], {
      clipPath: "inset(0 0 0 0)", // Start fully visible
    });
    // Animate clip-path to reveal underlying layers
    colorStylesTl
      .to(firstLayer, {
        clipPath: "inset(0 100% 0 0)", // Animate from fully visible to hidden from right
        ease: "none",
      })
      .to(secondLayer, {
        clipPath: "inset(0 100% 0 0)",
        ease: "none",
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
        className="relative h-dvh min-h-[1000px] w-full overflow-hidden"
      >
        <img
          ref={backgroundRef}
          className="absolute left-1/2 flex w-full max-w-[1825px] -translate-x-1/2 items-center"
          src="/explorations/04-learning-from-apple/hero_startframe_xlarge.jpg"
          alt="herostart frame"
        />
        <div className="relative flex w-full flex-col items-center justify-center pt-8 sm:pt-32 2xl:pt-72">
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
      <section className="relative flex h-full min-h-dvh flex-col items-center overflow-hidden bg-neutral-800 py-24 md:py-28 xl:py-40">
        <div className="mb-6 w-[87.5vw] max-w-[1600px] grow md:mb-8 lg:mb-10 xl:mb-12">
          <h2 className="apple-headline text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            Get the highlights.
          </h2>
        </div>

        <div
          ref={scrollContainer}
          className="margin no-scrollbar h-full w-full snap-x snap-mandatory scroll-pl-[var(--media-padding)] overflow-y-hidden overflow-x-scroll"
        >
          <ul className="media-left-padding relative grid w-max grid-flow-col gap-6 after:block after:w-[100vw]">
            <li className={` ${styles["media-slideshow-container"]}`}>
              <figure className="absolute inset-0">
                <video
                  src="/explorations/04-learning-from-apple/section2_xlarge_2x.mp4"
                  className="h-full w-full object-cover"
                ></video>
              </figure>
              <div className="absolute left-8 top-6">
                <p className="apple-caption w-80 text-xl font-semibold xl:text-2xl">
                  the first iPhone built for Apple Intelligence. Personal,
                  private, powerful
                </p>
              </div>
            </li>
            <li className={` ${styles["media-slideshow-container"]}`}>
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
            <li className={` ${styles["media-slideshow-container"]}`}>
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
            <li className={` ${styles["media-slideshow-container"]}`}>
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
        <div className="fixed bottom-8 left-1/2 z-10 flex h-[52px] -translate-x-1/2 gap-8">
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
      <section className="relative z-0 flex flex-col items-center bg-[#000] py-24 md:py-28 xl:py-40">
        <div className="mb-6 w-[87.5vw] max-w-[1600px] grow md:mb-8 lg:mb-10 xl:mb-12">
          <h2 className="apple-headline text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            Take a closer look
          </h2>
        </div>
        <img
          ref={colorsImgRef}
          src="/explorations/04-learning-from-apple/all_colors_xlarge.jpg"
        />
        <div className="fixed bottom-8 left-1/2 flex -translate-x-1/2 gap-8">
          <div
            className="flex h-[52px] items-center rounded-full bg-neutral-600 px-6 py-4"
            ref={colorNavRef}
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
      <section className="relative flex flex-col items-center gap-6 bg-[#000] py-24 md:gap-8 md:py-28 xl:gap-10 xl:py-40">
        <div className="text-center text-[36px] font-semibold leading-[1.05] tracking-[-0.015em] md:text-[44px] lg:text-[64px] 2xl:text-[80px]">
          Choose your
          <br />
          Photographic Style.
          <br />
          Change&nbsp;it&nbsp;up. Change&nbsp;it&nbsp;back.
        </div>
        <div
          ref={colorStyleContainer}
          className="relative min-h-[350vh] w-full"
        >
          <div
            className={`absolute z-[3] ${styles["color-style-media"]}`}
            style={{
              backgroundImage:
                "url('/explorations/04-learning-from-apple/hero_style1_large_2x.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            className={`absolute z-[2] ${styles["color-style-media"]}`}
            style={{
              backgroundImage:
                "url('/explorations/04-learning-from-apple/hero_style2_large_2x.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            className={`absolute z-[1] ${styles["color-style-media"]}`}
            style={{
              backgroundImage:
                "url('/explorations/04-learning-from-apple/hero_style3_large_2x.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
      </section>
    </div>
  );
}
