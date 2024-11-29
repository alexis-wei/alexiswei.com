import dynamic from "next/dynamic";

const ARScene = dynamic(() => import("./ARScene.jsx"), {
  ssr: false,
  loading: () => <div>Loading AR Scene...</div>,
});

export default function ARMap() {
  return <ARScene />;
}
