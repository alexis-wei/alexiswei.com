"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import MovingGradient from "./MovingGradient";
import { useState } from "react";

const Home = () => {
  const white = "#ffffff";
  const blue = "#bfe0ff";
  const yellow = "#ffec99";
  const green = "#d8f5a2";

  const [color, setColor] = useState(white);
  const router = useRouter();

  const changeColor = (color: string) => {
    setColor(color);
  };

  const handleEnterPortfolio = (page: number) => {
    router.push(`/portfolio?page=${page}`);
  };

  return (
    <div className="flex h-dvh w-dvw flex-col items-stretch justify-between p-9 transition-all duration-700 fade-out sm:flex-row">
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
          onClick={() => window.open("mailto:hi@alexiswei.com", "_blank")}
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
          onClick={() => window.open("https://github.com/alexis-wei", "_blank")}
        >
          <IconFeGithub />
        </Button>
      </div>
    </div>
  );
};

export default Home;