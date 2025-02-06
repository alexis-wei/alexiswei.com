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
  const [transition, setTransition] = useState(0);

  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTextures: { value: textures as THREE.Texture[] },
      uHoveredSlice: { value: hoveredSlice },
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
      uniform float uTotalSlices;
      uniform float uTransition;
      varying vec2 vUv;

      float easeOutCubic(float x) {
        return 1.0 - pow(1.0 - x, 3.0);
      }

      void main() {
        float sliceWidth = 1.0 / uTotalSlices;
        float currentSlice = floor(vUv.x * uTotalSlices);
        
        // Each slice shows a portion of the full-width image
        vec2 finalUv = vUv;
        finalUv.x = (currentSlice + vUv.x - floor(vUv.x * uTotalSlices)) / uTotalSlices;
        
        if (uHoveredSlice >= 0.0) {
          float t = easeOutCubic(uTransition);
          
          if (currentSlice == uHoveredSlice) {
            // For hovered slice, expand UV range to show more of the image
            float startX = currentSlice / uTotalSlices;
            float endX = (currentSlice + 1.0) / uTotalSlices;
            float fullImageX = vUv.x;
            
            // Transition from slice view to full image view
            finalUv.x = mix(
              // Starting state: only show slice portion
              mix(startX, endX, (vUv.x * uTotalSlices - currentSlice)),
              // End state: show full width image
              fullImageX,
              t
            );
          } else {
            // For non-hovered slices, push them off screen
            float pushDirection = currentSlice < uHoveredSlice ? -1.0 : 1.0;
            float offset = pushDirection * t;
            finalUv.x += offset;
          }
        }

        // Discard pixels outside valid range
        if (finalUv.x < 0.0 || finalUv.x > 1.0) {
          discard;
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

  useFrame((state, delta) => {
    const targetTransition = hoveredSlice >= 0 ? 1 : 0;
    const newTransition = THREE.MathUtils.lerp(
      transition,
      targetTransition,
      delta * 1.5, // Adjust speed as needed
    );
    setTransition(newTransition);
    shaderMaterial.uniforms.uTransition.value = newTransition;
  });

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    const x = (event.point.x + viewport.width / 2) / viewport.width;
    const sliceIndex = Math.floor(x * 5);
    setHoveredSlice(sliceIndex);
  };

  const handlePointerLeave = (event: ThreeEvent<PointerEvent>) => {
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
    <div className="h-full w-full max-w-[1000px]">
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

      <div className="aspect-[3/2] w-full">
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
    </div>
  );
}
