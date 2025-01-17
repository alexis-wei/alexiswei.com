"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import MeshComponent from "./Mesh";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import classes from "@/lib/global.module.css";

const Saturn = () => {
  const [gltf, setGltf] = useState<GLTF | null>(null);
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load("/saturn/scene.gltf", (gltf) => {
      setGltf(gltf);
    });
  }, []);

  return (
    <div>
      <Canvas
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        className={`duration-1000 fade-in fade-out ${gltf ? "opacity-100" : "opacity-0"}`}
      >
        <ambientLight color="#fcf9ea" />
        <directionalLight color="#f3ecd1" position={[0, 3, 5]} intensity={1} />
        <directionalLight color="#fff" position={[-1, 5, 0]} intensity={1} />
        <directionalLight color="#fff" position={[-2, 3, 2]} intensity={1} />
        {gltf && <MeshComponent gltfModel={gltf.scene} />}
      </Canvas>
      <div
        className={`${classes.loader} duration-300 fade-in fade-out ${gltf ? "hidden opacity-0" : "opacity-100"}`}
      />
    </div>
  );
};
export default Saturn;
