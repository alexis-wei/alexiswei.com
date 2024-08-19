import React from "react";
import HomePage from "../components/home";
import Welcome from "@/components/saturn/Welcome";

export default function Home() {
  return (
    <main style={{ position: "relative" }}>
      <HomePage />
      <Welcome />
    </main>
  );
}
