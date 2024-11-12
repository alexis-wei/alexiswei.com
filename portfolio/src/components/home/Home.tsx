"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import MovingGradient from "./MovingGradient";
import { useEffect, useState } from "react";
import { motion, useMotionValue } from "framer-motion";

const Home = () => {
  const white = "#ffffff";
  const blue = "#bfe0ff";
  const yellow = "#ffec99";
  const green = "#d8f5a2";

  const [color, setColor] = useState(white);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const router = useRouter();
  const aboutY = useMotionValue(4000);

  const changeColor = (color: string) => {
    setColor(color);
  };

  const handleEnterPortfolio = (page: number) => {
    router.push(`/portfolio?page=${page}`);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const scrollDirection = e.deltaY > 0 ? "down" : "up";
    updateAboutY(scrollDirection);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart === null) return;

    const currentTouch = e.touches[0].clientY;
    const diff = touchStart - currentTouch;
    const scrollDirection = diff > 0 ? "down" : "up";
    updateAboutY(scrollDirection);
  };

  const updateAboutY = (scrollDir: "up" | "down") => {
    if (isTransitioning) {
      return;
    }

    if (scrollDir === "down" && aboutY.get() !== 0) {
      aboutY.set(0);
      setIsTransitioning(true);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 800);
    } else if (scrollDir === "up" && aboutY.get() === 0) {
      aboutY.set(window.innerHeight);
      setIsTransitioning(true);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 800);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStart(e.touches[0].clientY);
  };

  useEffect(() => {
    aboutY.set(window.innerHeight);

    const handleResize = () => {
      if (aboutY.get() !== 0) aboutY.set(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className="max-w-dvw relative flex max-h-dvh flex-col items-start overflow-hidden"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div className="flex h-dvh w-dvw shrink-0 flex-col items-stretch justify-between p-9 transition-all duration-700 fade-out sm:flex-row">
        <MovingGradient color={color} />
        <div className="flex h-full w-full flex-col gap-2.5 text-stone-900">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1">
              <p className="text-lg font-medium leading-none tracking-tighter">
                hi, i&apos;m
              </p>
              <h1 className="text-xl leading-none tracking-tighter">alexis</h1>
            </div>
            <p className="max-w-72 text-lg font-medium leading-[1.3] tracking-tighter">
              a design engineer working with startups on:
            </p>
          </div>
          <div
            className="flex max-w-72 flex-wrap gap-2"
            onMouseLeave={() => changeColor(white)}
          >
            <Button
              className={`rounded-none font-serif font-bold shadow-md hover:border-stone-600 hover:bg-[#ffec99] hover:shadow-none`}
              variant="outline"
              onMouseEnter={() => changeColor(yellow)}
              onClick={() => handleEnterPortfolio(1)}
            >
              0 &#x2192; 1 product
            </Button>
            <Button
              className={`rounded-none font-serif font-bold shadow-md hover:border-stone-600 hover:bg-[#bfe0ff] hover:shadow-none`}
              variant="outline"
              onMouseEnter={() => changeColor(blue)}
              onClick={() => handleEnterPortfolio(2)}
            >
              branding
            </Button>
            <Button
              className={`rounded-none font-serif font-bold shadow-md hover:border-stone-600 hover:bg-[#d8f5a2] hover:shadow-none`}
              variant="outline"
              onMouseEnter={() => changeColor(green)}
            >
              immersive experiences
            </Button>
          </div>
        </div>

        <div className="flex h-fit items-start">
          <Button
            className="w-6 text-stone-400"
            variant="ghost"
            size="icon"
            onClick={() =>
              window.open("https://www.cal.com/itsalexiswei", "_blank")
            }
          >
            <IconHeroiconsCalendar />
          </Button>
          <Button
            className="w-6 text-stone-400"
            variant="ghost"
            size="icon"
            onClick={() =>
              window.open("https://www.x.com/itsalexiswei", "_blank")
            }
          >
            <IconBasilTwitterOutline />
          </Button>
          <Button
            className="w-6 text-stone-400"
            variant="ghost"
            size="icon"
            onClick={() =>
              window.open("mailto:alexisw.contact@gmail.com", "_blank")
            }
          >
            <IconHeroiconsEnvelope />
          </Button>
          <Button
            className="w-6 text-stone-400"
            variant="ghost"
            size="icon"
            onClick={() =>
              window.open("https://alexiswei0108.substack.com/", "_blank")
            }
          >
            <IconBiSubstack className="scale-[80%]" />
          </Button>
          <Button
            className="w-6 text-stone-400"
            variant="ghost"
            size="icon"
            onClick={() =>
              window.open("https://github.com/alexis-wei", "_blank")
            }
          >
            <IconFeGithub />
          </Button>
        </div>
      </div>

      <motion.div
        style={{ y: aboutY }}
        transition={{ duration: 0.8 }}
        className="absolute flex h-dvh w-dvw shrink-0 flex-col items-center justify-between bg-black p-9 text-white transition-all duration-700 fade-out"
      >
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-baseline gap-1">
            <p className="text-lg font-medium leading-none tracking-tighter">
              hi, i&apos;m
            </p>
            <h1 className="text-xl leading-none tracking-tighter">alexis</h1>
          </div>
          <div className="flex max-w-96 flex-col gap-4">
            <p className="text-lg font-medium leading-[1.3] tracking-tighter">
              for the last 5 years, i’ve been in the world of startups—building
              in robotics, consumer social and e-commerce. i’m an engineer by
              trade but my heart lives in design. design engineer is the closest
              “title” to describe my past roles, but the goal at the end of the
              day is to do whatever it takes to create delightful products, with
              some really cool people.
            </p>
            <p className="text-lg font-medium leading-[1.3] tracking-tighter">
              if you’re working on something that you think can make people feel
              something, i’d love to{" "}
              <a href="https://www.cal.com/itsalexiswei">
                <u>meet</u>
              </a>{" "}
              you.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
