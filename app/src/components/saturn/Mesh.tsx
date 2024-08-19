"use client";

import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Mesh } from "three";

export default function MeshComponent() {
  const fileUrl = "/saturn/scene.gltf";
  const mesh = useRef<Mesh>(null!);
  const { nodes, materials, scene } = useLoader(GLTFLoader, fileUrl);

  console.log("nodes", nodes);
  console.log("materials", materials);
  // useFrame(() => {
  //   mesh.current.rotation.y += 0.01;
  // });

  return (
    <mesh ref={mesh}>
      <primitive object={scene} />
    </mesh>
  );
}
