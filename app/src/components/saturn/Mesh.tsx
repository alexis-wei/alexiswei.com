"use client";

import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Mesh } from "three";

export default function MeshComponent() {
  const fileUrl = "/saturn/scene.gltf";
  const mesh = useRef<Mesh>(null!);
  const { nodes, materials, scene } = useLoader(GLTFLoader, fileUrl);

  return (
    <mesh ref={mesh} rotation={[0.1, 0.3, 0.7]}>
      <primitive object={scene} />
    </mesh>
  );
}
