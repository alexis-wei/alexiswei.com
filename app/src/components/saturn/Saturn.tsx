"use client";

import { Canvas } from "@react-three/fiber";
import MeshComponent from "./Mesh";

export default function Saturn() {
  return (
    <Canvas style={{ height: "10dvh", maxWidth: "100dvw" }}>
      <ambientLight color="#fcf9ea" />
      <ambientLight color="#fcf9ea" />
      <ambientLight color="#fcf9ea" />
      <directionalLight color="#fde99c" position={[0, 0, 100]} />
      <MeshComponent />
    </Canvas>
  );
}
