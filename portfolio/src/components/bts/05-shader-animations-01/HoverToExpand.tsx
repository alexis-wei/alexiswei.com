"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Canvas,
  useLoader,
  useThree,
  ThreeEvent,
  useFrame,
} from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import * as THREE from "three";
import { Caption } from "../ui";

const IMAGE_URLS = [
  process.env.NEXT_PUBLIC_MEDIA_URL + "/banff/banff-horizontal-1.jpg",
  process.env.NEXT_PUBLIC_MEDIA_URL + "/banff/banff-horizontal-2.jpg",
  process.env.NEXT_PUBLIC_MEDIA_URL + "/banff/banff-horizontal-3.jpg",
  process.env.NEXT_PUBLIC_MEDIA_URL + "/banff/banff-horizontal-4.jpg",
  process.env.NEXT_PUBLIC_MEDIA_URL + "/banff/banff-horizontal-5.jpg",
];

/**
 * ShaderPlane displays a mesh that combines 5 images as textures into one image
 * @returns
 */
function ShaderPlane() {
  const textures = useLoader(TextureLoader, IMAGE_URLS);
  const { viewport } = useThree();

  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTextures: { value: textures as THREE.Texture[] },
      uTotalSlices: { value: 5.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTextures[5];
      uniform float uTotalSlices;
      varying vec2 vUv;

      void main() {
        float sliceWidth = 1.0 / uTotalSlices;
        float currentSlice = floor(vUv.x * uTotalSlices);
        
        // Sample from the appropriate texture based on the slice
        vec4 color;
        if (currentSlice == 0.0) color = texture2D(uTextures[0], vUv);
        else if (currentSlice == 1.0) color = texture2D(uTextures[1], vUv);
        else if (currentSlice == 2.0) color = texture2D(uTextures[2], vUv);
        else if (currentSlice == 3.0) color = texture2D(uTextures[3], vUv);
        else color = texture2D(uTextures[4], vUv);

        gl_FragColor = color;
      }
    `,
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}

function ShaderPlaneWithHover() {
  const textures = useLoader(TextureLoader, IMAGE_URLS);
  const { viewport } = useThree();
  const [hoveredSlice, setHoveredSlice] = useState<number>(-1);
  const [lastHoveredSlice, setLastHoveredSlice] = useState<number>(-1);
  const [transition, setTransition] = useState(0);

  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTextures: { value: textures as THREE.Texture[] },
      uHoveredSlice: { value: hoveredSlice },
      uLastHoveredSlice: { value: lastHoveredSlice },
      uTotalSlices: { value: 5.0 },
      uTransition: { value: transition },
    },
    vertexShader: `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTextures[5];
      uniform float uHoveredSlice;
      uniform float uLastHoveredSlice;
      uniform float uTotalSlices;
      uniform float uTransition;
      varying vec2 vUv;

      float easeOutCubic(float x) {
        return 1.0 - pow(1.0 - x, 3.0);
      }

      void main() {
        float sliceWidth = 1.0 / uTotalSlices;
        vec2 finalUv = vUv;
        float currentSlice;

        float activeSlice = uHoveredSlice >= 0.0 ? uHoveredSlice : uLastHoveredSlice;
        
        if (activeSlice >= 0.0) {
          // on hover, the current slice changes
          float t = easeOutCubic(uTransition);

          // define left and right boundaries of hovered slice
          float leftSpace = (sliceWidth * activeSlice);
          float rightSpace = (sliceWidth * activeSlice) + sliceWidth;
          float hoveredLeftPos = leftSpace - t * leftSpace;
          float hoveredRightPos = rightSpace + t * (1.0 - rightSpace);

          // if vUv.x is in between hoveredLeftPos and hoveredRightPos then it's on the hovering slice
          if (vUv.x > hoveredLeftPos && vUv.x < hoveredRightPos) {
            currentSlice = activeSlice;
          } else {
            currentSlice = floor(vUv.x * uTotalSlices);
          }
        } else {
          currentSlice = floor(vUv.x * uTotalSlices);
        }

        // Sample from the appropriate texture
        vec4 color;
        if (currentSlice == 0.0) color = texture2D(uTextures[0], finalUv);
        else if (currentSlice == 1.0) color = texture2D(uTextures[1], finalUv);
        else if (currentSlice == 2.0) color = texture2D(uTextures[2], finalUv);
        else if (currentSlice == 3.0) color = texture2D(uTextures[3], finalUv);
        else color = texture2D(uTextures[4], finalUv);

        gl_FragColor = color;
      }
    `,
  });

  useFrame((_, delta) => {
    const targetTransition = hoveredSlice >= 0 ? 1 : 0;
    let speed: number;
    if (hoveredSlice == -1) {
      speed = delta * 6;
    } else {
      speed = delta * 2;
    }

    const newTransition = THREE.MathUtils.clamp(
      THREE.MathUtils.lerp(transition, targetTransition, speed),
      0,
      1,
    );
    setTransition(newTransition);
    shaderMaterial.uniforms.uTransition.value = newTransition;
  });

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    // set hover slice ONLY if last slice is -1
    if (hoveredSlice == -1) {
      const x = (event.point.x + viewport.width / 2) / viewport.width;
      const sliceIndex = Math.floor(x * 5);
      setLastHoveredSlice(sliceIndex);
      setHoveredSlice(sliceIndex);
    }
  };

  const handlePointerLeave = () => {
    setLastHoveredSlice(hoveredSlice);
    setHoveredSlice(-1);
  };

  return (
    <mesh
      scale={[viewport.width, viewport.height, 1]}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <planeGeometry />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}

export default function CanvasOne() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex size-full max-w-[1000px] flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <div className="aspect-[3/2] w-full">
          <Canvas
            camera={{ position: [0, 0, 1], fov: 50 }}
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <Suspense fallback={null}>
              <ShaderPlane />
            </Suspense>
          </Canvas>
        </div>
        <Caption>
          small progressions, first just using shaders to display the images in
          its desired slices
        </Caption>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="aspect-[3/2] w-full cursor-pointer">
          <Canvas
            camera={{ position: [0, 0, 1], fov: 50 }}
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <Suspense fallback={null}>
              <ShaderPlaneWithHover />
            </Suspense>
          </Canvas>
        </div>
        <Caption>
          hoverable version: hover on each image slice and watch
        </Caption>
      </div>
    </div>
  );
}
