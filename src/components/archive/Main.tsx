"use client";
import { useEffect } from "react";
import Home from "./Home";
import Welcome from "./Welcome";
import { useHasMounted } from "@/lib/useHasMounted";

const Main = () => {
  const mounted = useHasMounted();
  // Derive hasVisited synchronously from sessionStorage once we're on the client.
  // useSyncExternalStore (inside useHasMounted) ensures this reads the correct
  // value without an extra setState-triggered re-render.
  const hasVisited = mounted
    ? sessionStorage.getItem("hasVisitedBefore") === "true"
    : false;

  // Write side-effect only — no setState needed
  useEffect(() => {
    if (!sessionStorage.getItem("hasVisitedBefore")) {
      sessionStorage.setItem("hasVisitedBefore", "true");
    }
  }, []);

  return (
    <div className="flex h-dvh w-dvw items-center justify-center">
      <Home />
      {mounted && !hasVisited && <Welcome />}
    </div>
  );
};
export default Main;
