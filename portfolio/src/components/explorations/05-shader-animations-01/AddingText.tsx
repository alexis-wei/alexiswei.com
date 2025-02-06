"use client";

import {
  useState,
  useEffect,
  Suspense,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import * as THREE from "three";
import { Caption } from "../ui";
import { Afacad } from "next/font/google";

const afacad = Afacad({
  subsets: ["latin"],
  weight: ["700"],
});

const IMAGE_URLS = [
  process.env.NEXT_PUBLIC_MEDIA_URL + "/banff/banff-horizontal-1.jpg",
  process.env.NEXT_PUBLIC_MEDIA_URL + "/banff/banff-horizontal-2.jpg",
  process.env.NEXT_PUBLIC_MEDIA_URL + "/banff/banff-horizontal-3.jpg",
  process.env.NEXT_PUBLIC_MEDIA_URL + "/banff/banff-horizontal-4.jpg",
  process.env.NEXT_PUBLIC_MEDIA_URL + "/banff/banff-horizontal-5.jpg",
];

// Custom debounce hook
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );
}

function HoverWithText({ hoveredSlice }: { hoveredSlice: number }) {
  const textures = useLoader(TextureLoader, IMAGE_URLS);
  const { viewport } = useThree();
  const [lastHoveredSlice, setLastHoveredSlice] = useState<number>(-1);
  const [transition, setTransition] = useState(0);

  // Update lastHoveredSlice when hoveredSlice changes
  useEffect(() => {
    if (hoveredSlice >= 0) {
      setLastHoveredSlice(hoveredSlice);
    }
    // Don't update lastHoveredSlice when hoveredSlice becomes -1
    // This allows us to keep the last hovered slice during the transition out
  }, [hoveredSlice]);

  // Memoize the shader material
  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
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

      float easeInOutCubic(float x) {
        return x < 0.5 
          ? 4.0 * x * x * x 
          : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
      }

      void main() {
        float sliceWidth = 1.0 / uTotalSlices;
        vec2 finalUv = vUv;
        float currentSlice;

        float activeSlice = uHoveredSlice >= 0.0 ? uHoveredSlice : uLastHoveredSlice;
        
        if (activeSlice >= 0.0) {
          float t = uHoveredSlice >= 0.0 ? easeInOutCubic(uTransition) : easeOutCubic(uTransition);

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
      }),
    [textures],
  ); // Only recreate if textures change

  // Update uniforms directly instead of recreating material
  useEffect(() => {
    shaderMaterial.uniforms.uHoveredSlice.value = hoveredSlice;
    shaderMaterial.uniforms.uLastHoveredSlice.value = lastHoveredSlice;
  }, [hoveredSlice, lastHoveredSlice, shaderMaterial.uniforms]);

  useFrame((_, delta) => {
    const targetTransition = hoveredSlice >= 0 ? 1 : 0;
    let speed: number;

    if (hoveredSlice === -1) {
      speed = delta * 6; // 2x faster exit (was 2.5)
    } else {
      speed = delta * 2; // Keep the same smooth entry speed
    }

    // Use smoother lerp for transitions
    const newTransition = THREE.MathUtils.lerp(
      transition,
      targetTransition,
      speed,
    );

    // Only clamp the final value to prevent sudden stops
    const clampedTransition = THREE.MathUtils.clamp(newTransition, 0, 1);

    // Add a small threshold to prevent floating point jitter
    if (Math.abs(clampedTransition - transition) > 0.0001) {
      setTransition(clampedTransition);
      shaderMaterial.uniforms.uTransition.value = clampedTransition;
    }

    // Only reset lastHoveredSlice after the transition is fully complete
    if (hoveredSlice === -1 && clampedTransition < 0.001) {
      setLastHoveredSlice(-1);
    }
  });

  return (
    <group>
      <mesh scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry />
        <primitive object={shaderMaterial} attach="material" />
      </mesh>
    </group>
  );
}

function TextOverlay({
  onHover,
  onLeave,
}: {
  onHover: (index: number) => void;
  onLeave: () => void;
}) {
  const letters = ["B", "A", "N", "F", "F"];

  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center gap-4">
      {letters.map((letter, index) => (
        <span
          key={index}
          className={`${afacad.className} hover:text-shadow-sm hover:text-shadow-gray-500 cursor-pointer text-4xl text-white transition-all duration-300 hover:mix-blend-overlay`}
          onMouseEnter={() => onHover(index)}
          onMouseLeave={onLeave}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}

export default function AddingText() {
  const [mounted, setMounted] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(true);

  // Preload images
  useEffect(() => {
    const preloadImages = async () => {
      try {
        await Promise.all(
          IMAGE_URLS.map((url) => {
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.src = url;
              img.onload = resolve;
              img.onerror = reject;
            });
          }),
        );
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to preload images:", error);
        setIsLoading(false);
      }
    };

    preloadImages();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex h-full w-full max-w-[1000px] flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <div className="relative aspect-[3/2] w-full">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <div className="text-white">Loading...</div>
            </div>
          ) : (
            <>
              <Canvas
                camera={{ position: [0, 0, 1], fov: 50 }}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <Suspense fallback={null}>
                  <HoverWithText hoveredSlice={hoveredSlice} />
                </Suspense>
              </Canvas>
              <TextOverlay
                onHover={(index) => {
                  setHoveredSlice(index);
                }}
                onLeave={() => {
                  setHoveredSlice(-1);
                }}
              />
            </>
          )}
        </div>
        <Caption>
          Hover over the letters to reveal different views of Banff
        </Caption>
      </div>
    </div>
  );
}
