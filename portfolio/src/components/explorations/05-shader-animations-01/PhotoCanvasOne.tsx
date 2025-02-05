"use client";

import { useState, useEffect, Suspense } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import * as THREE from "three";

const IMAGE_URL =
  process.env.NEXT_PUBLIC_MEDIA_URL + "/banff/banff-horizontal-1.jpg";

function Plane({ url }: { url: string }) {
  const texture = useLoader(TextureLoader, url);
  const { viewport } = useThree();

  // Calculate aspect ratios
  const imageAspect = texture.image.width / texture.image.height;
  const viewportAspect = viewport.width / viewport.height;

  // Determine scale to fit image to screen
  let scale;
  if (imageAspect > viewportAspect) {
    scale = new THREE.Vector3(viewport.width, viewport.width / imageAspect, 1);
  } else {
    scale = new THREE.Vector3(
      viewport.height * imageAspect,
      viewport.height,
      1,
    );
  }

  return (
    <mesh scale={scale}>
      <planeGeometry />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function PhotoCanvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="h-screen w-full">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 50 }}
        style={{
          width: "100vw",
          height: "100vh",
          maxWidth: "1000px",
        }}
      >
        <Suspense fallback={null}>
          <Plane url={IMAGE_URL} />
        </Suspense>
      </Canvas>
    </div>
  );
}
