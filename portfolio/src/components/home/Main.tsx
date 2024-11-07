"use client";
import { useEffect, useState } from "react";
import Home from "./Home";
import Welcome from "./Welcome";

const Main = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasVisited, setHasVisited] = useState(false);

  useEffect(() => {
    const visited = sessionStorage.getItem("hasVisitedBefore");
    if (!visited) {
      sessionStorage.setItem("hasVisitedBefore", "true");
    } else {
      setHasVisited(true);
    }

    setIsLoading(false);
  }, []);

  return (
    <div className="flex h-dvh w-dvw items-center justify-center">
      {!isLoading && (
        <>
          <Home />
          {!hasVisited && <Welcome />}
        </>
      )}
    </div>
  );
};
export default Main;
