"use client";

import { useState, useEffect, Suspense } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import * as THREE from "three";
import { Caption } from "../ui";

const IMAGE_URL =
  process.env.NEXT_PUBLIC_MEDIA_URL + "/banff/banff-horizontal-1.jpg";

function ShaderPlane({ url }: { url: string }) {
  const texture = useLoader(TextureLoader, url);

  const imageAspect = texture.image.width / texture.image.height;
  const scale = getMeshScale(imageAspect);

  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
    },
    vertexShader: `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      varying vec2 vUv;

      void main() {
        vec4 texture = texture2D(uTexture, vUv);
        gl_FragColor = texture;
      }
    `,
  });

  return (
    <mesh scale={scale}>
      <planeGeometry />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}

function BasicPlane({ url }: { url: string }) {
  const texture = useLoader(TextureLoader, url);

  const imageAspect = texture.image.width / texture.image.height;
  const scale = getMeshScale(imageAspect);

  return (
    <mesh scale={scale}>
      <planeGeometry />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

const getMeshScale = (imageAspect: number): THREE.Vector3 => {
  const { viewport } = useThree();

  const viewportAspect = viewport.width / viewport.height;
  let scale: THREE.Vector3;
  if (imageAspect > viewportAspect) {
    // Image is wider than viewport - scale by height
    scale = new THREE.Vector3(
      viewport.height * imageAspect,
      viewport.height,
      1,
    );
  } else {
    // Image is taller than viewport - scale by width
    scale = new THREE.Vector3(viewport.width, viewport.width / imageAspect, 1);
  }

  return scale;
};

export default function PhotoCanvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="grid h-full w-full max-w-[1000px] grid-cols-1 gap-4 md:grid-cols-3">
      <div className="flex flex-col items-center justify-start gap-2">
        <img src={IMAGE_URL} className="aspect-[3/2] w-full" />
        <Caption>{`using regular <img> tag`}</Caption>
      </div>
      <div className="flex flex-col items-center justify-start gap-2">
        <div className="aspect-[3/2] w-full">
          <Canvas
            camera={{ position: [0, 0, 1], fov: 50 }}
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <Suspense fallback={null}>
              <BasicPlane url={IMAGE_URL} />
            </Suspense>
          </Canvas>
        </div>
        <Caption>
          threejs plane w/ <code>meshBasicMaterial</code>
        </Caption>
      </div>
      <div className="flex flex-col items-center justify-start gap-2">
        <div className="aspect-[3/2] w-full">
          <Canvas
            camera={{ position: [0, 0, 1], fov: 50 }}
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <Suspense fallback={null}>
              <ShaderPlane url={IMAGE_URL} />
            </Suspense>
          </Canvas>
        </div>
        <Caption>threejs plane w/ basic custom shader material</Caption>
      </div>
    </div>
  );
}
