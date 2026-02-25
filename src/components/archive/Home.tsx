"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import MovingGradient from "./MovingGradient";
import { useState, useSyncExternalStore } from "react";
import SocialMedia from "@/lib/SocialMedia";

// Stable reference — defined outside the component so it never changes identity
function subscribeToResize(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

const Home = () => {
  const white = "#ffffff";
  const blue = "#bfe0ff";
  const yellow = "#ffec99";
  const green = "#d8f5a2";

  const [color, setColor] = useState(white);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const router = useRouter();

  // useSyncExternalStore subscribes to resize events so yValue stays accurate
  // without setState-in-effect. The server snapshot (9999) keeps the panel
  // safely off-screen during SSR; the client snapshot uses the real height.
  const windowHeight = useSyncExternalStore(
    subscribeToResize,
    () => window.innerHeight,
    () => 9999,
  );
  const yValue = isAboutVisible ? 0 : windowHeight + 10;

  const changeColor = (c: string) => {
    setColor(c);
  };

  const hideAbout = () => {
    setIsAboutVisible(false);
    setIsTransitioning(true);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 700);
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

    if (scrollDir === "down" && !isAboutVisible) {
      setIsAboutVisible(true);
      setIsTransitioning(true);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 700);
    } else if (scrollDir === "up" && isAboutVisible) {
      hideAbout();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStart(e.touches[0].clientY);
  };

  return (
    <div
      className="max-w-dvw fixed flex max-h-dvh flex-col items-start overflow-hidden"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div className="flex h-dvh w-dvw shrink-0 flex-col items-start justify-between p-9 transition-all duration-700 fade-out sm:flex-row">
        <MovingGradient color={color} />
        <div className="flex size-full flex-col gap-2.5 text-stone-900">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1">
              <p className="text-lg font-medium leading-none tracking-tighter">
                hi, i&apos;m
              </p>
              <h1 className="text-xl leading-none tracking-tighter">alexis</h1>
            </div>
            <p className="max-w-72 text-lg font-medium leading-[1.3] tracking-tighter">
              an interactive design engineer working with companies on:
            </p>
          </div>
          <div
            className="flex max-w-72 flex-wrap gap-2"
            onMouseLeave={() => changeColor(white)}
          >
            <Button
              className={`font-serif font-bold hover:bg-[#ffec99]`}
              variant="outline"
              onMouseEnter={() => changeColor(yellow)}
            >
              0 &#x2192; 1 product
            </Button>
            <Button
              className={`font-serif font-bold hover:bg-[#bfe0ff]`}
              variant="outline"
              onMouseEnter={() => changeColor(blue)}
            >
              branding
            </Button>
            <Button
              className={`font-serif font-bold hover:bg-[#d8f5a2]`}
              variant="outline"
              onMouseEnter={() => changeColor(green)}
            >
              immersive experiences
            </Button>
          </div>
        </div>

        <SocialMedia />
      </div>

      <div
        className="absolute flex h-dvh w-dvw shrink-0 flex-col justify-between gap-6 bg-black p-9 text-white transition-all duration-700 fade-out"
        style={{ top: yValue }}
      >
        <div className="flex w-full flex-col justify-start gap-1">
          <div className="flex items-baseline gap-1">
            <p className="text-lg font-medium leading-none tracking-tighter">
              hi, i&apos;m
            </p>
            <h1 className="text-xl leading-none tracking-tighter">alexis</h1>
          </div>
          <div className="flex max-w-96 flex-col gap-4">
            <p className="text-lg font-medium leading-[1.3] tracking-tighter">
              for the last 5 years, i&rsquo;ve been in the world of
              startups&mdash;building in robotics, consumer social and
              e-commerce. i&rsquo;m an engineer by trade but my heart lives in
              design. design engineer is the closest &ldquo;title&rdquo; to
              describe my past roles, but the goal at the end of the day is to
              do whatever it takes to create delightful products, with some
              really cool people.
            </p>
            <p className="text-lg font-medium leading-[1.3] tracking-tighter">
              if you&rsquo;re working on something that you think can make
              people feel something, i&rsquo;d love to{" "}
              <a href="https://www.cal.com/itsalexiswei">
                <u>meet</u>
              </a>{" "}
              you.
            </p>
          </div>
        </div>
        <div className="flex w-full justify-end">
          <Button
            variant="ghost"
            className="text-white hover:font-semibold hover:text-white"
            onClick={() => router.push("/portfolio")}
          >
            see works &#187;
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 gap-0 rounded-none text-white [&_svg]:pointer-events-auto [&_svg]:size-6"
          onClick={() => hideAbout()}
        >
          <IconHeroiconsXMark className="size-full text-white" />
        </Button>
      </div>
    </div>
  );
};

export default Home;
