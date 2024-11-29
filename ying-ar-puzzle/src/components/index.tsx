import dynamic from "next/dynamic";

const ARScene = dynamic(() => import("./ARScene.jsx"), {
  ssr: false,
});

export default function ARMap() {
  return <ARScene />;
}
