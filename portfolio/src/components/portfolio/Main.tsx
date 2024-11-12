"use client";

import { FC } from "react";
import TheDrop from "./TheDrop";
import Spotlight from "./Spotlight";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import DesignSystem from "./DesignSystem";

interface PortfolioProps {
  page: number;
}

interface PortfolioPage {
  name: string;
  component: JSX.Element;
}

const portfolioPages: PortfolioPage[] = [
  { name: "the drop", component: <TheDrop /> },
  { name: "spotlight", component: <Spotlight /> },
  { name: "design system", component: <DesignSystem /> },
];

const Main: FC<PortfolioProps> = (props: PortfolioProps): JSX.Element => {
  const router = useRouter();

  const handleUpdatePage = (newPage: number) => {
    router.push(`/portfolio?page=${newPage}`);
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center">
      <div
        className={`relative flex h-full min-h-screen w-full flex-col items-center justify-between transition-opacity duration-300 fade-in fade-out`}
      >
        <Button
          className="absolute left-6 top-8 z-10 flex items-center text-stone-800 hover:font-bold hover:text-stone-950"
          variant="ghost"
          onClick={() => {
            router.push("/");
          }}
        >
          <span className="text-center font-serif text-sm italic">
            &#171; &nbsp;home
          </span>
        </Button>
        {portfolioPages[props.page].component}
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex w-full justify-between px-4 sm:px-8">
            {props.page <= 0 ? (
              <Button
                variant="ghost"
                onClick={() => handleUpdatePage(portfolioPages.length - 1)}
              >
                &#171; &nbsp; {portfolioPages[portfolioPages.length - 1].name}
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => handleUpdatePage(props.page - 1)}
              >
                &#171; &nbsp; {portfolioPages[props.page - 1].name}
              </Button>
            )}

            {props.page >= portfolioPages.length - 1 ? (
              <Button variant="ghost" onClick={() => handleUpdatePage(0)}>
                {portfolioPages[0].name}
                &nbsp; &#187;
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => handleUpdatePage(props.page + 1)}
              >
                {portfolioPages[props.page + 1].name}
                &nbsp; &#187;
              </Button>
            )}
          </div>
          <span className="pb-8 text-sm italic">
            love from,{" "}
            <Button
              variant="ghost"
              className="px-0 pb-8 text-sm italic"
              onClick={handleGoHome}
            >
              alexis
            </Button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Main;
