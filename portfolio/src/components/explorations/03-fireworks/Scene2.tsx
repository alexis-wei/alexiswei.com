"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { BufferGeometry, Points } from "three";

interface BasicFireworkProps {
  radius?: number;
  timeSustained?: number;
  position?: [number, number, number];
}

const BasicFirework = ({
  radius = 0.2,
  timeSustained = 5,
  position = [0, 0, 0],
}: BasicFireworkProps) => {
  // This reference gives us direct access to our points
  const points = useRef<Points<BufferGeometry>>(null);

  // Add useFrame to update time uniform
  useFrame(({ clock }) => {
    if (points.current?.material) {
      (points.current.material as any).uniforms.time.value =
        clock.getElapsedTime();
    }
  });
  // You can see that, like our mesh, points also takes a geometry and a material,
  // but a specific material => pointsMaterial
  return (
    <points ref={points} position={position}>
      <sphereGeometry args={[radius, 18, 18]} />

      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={{
          size: { value: 0.1 },
          scale: { value: window.innerHeight / 2 }, // Scale factor based on screen size
          time: { value: 0 },
        }}
        vertexShader={`
          uniform float scale;
          uniform float size;
          uniform float time;

          float random(vec3 pos) {
            return fract(sin(dot(pos.xyz, vec3(12.9898, 78.233, 45.164))) * 43758.5453123);
          }

          float easeOutExpo(float x) {
            return x == 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * x);
          }
        
          
          void main() {
            vec3 pos = position;
            float delay = 0.2; // Delay in seconds before explosion
            float totalCycleTime = delay + ${timeSustained}.0; // Total time for one cycle
            float cycleTime = mod(time, totalCycleTime); // Time within current cycle
            float adjustedTime = max(0.0, cycleTime - delay);
            
            // Launch phase
            if (cycleTime < delay) {
              float launchProgress = cycleTime / (delay + 0.4); // 0 to 1
              float easeProgress = easeOutExpo(launchProgress); // Smooth out the movement
              
              // Start from below and move up to original position
              vec3 startPos = pos * 0.1; // Original compressed sphere
              startPos.y -= 2.0; // Start 2 units below
              vec3 endPos = pos * 0.1; // Target position
              vec3 launchPos = mix(startPos, endPos, easeProgress);
              
              vec4 mvPosition = modelViewMatrix * vec4(launchPos, 1.0);
              gl_Position = projectionMatrix * mvPosition;
              gl_PointSize = size * (scale / length(mvPosition.xyz));
              return;
            }

            float t = adjustedTime / ${timeSustained}.0; // Control explosion speed
            

            float explosionRadius = easeOutExpo(t) * 3.0; 
            float gravity = -0.6 * t * t;
            
            vec3 offset = pos * explosionRadius;
            offset.y += gravity;
            

            float rand = random(position);
            offset += vec3(
              cos(rand * 8.5) * 0.12,
              sin(rand * 9.42) * 0.15,
              cos(rand * 8.5) * 0.15
            ) * t;

            vec4 mvPosition = modelViewMatrix * vec4(offset, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            
            // Make particles fade out over time
            gl_PointSize = size * (scale / length(mvPosition.xyz)) * (1.0 - t) * (0.8 + rand * 0.4);
          }
        `}
        fragmentShader={`
          float random(vec2 st) {
              return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
          }

          float easeOutExpo(float t) {
              return t == 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t);
          }

          void main() {
            // Calculate distance from center of point
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);
            
            // Discard pixels outside of circle
            if (dist > 0.5) discard;

            // Add noise pattern
            float noise = random(gl_PointCoord * 12.0) * random(gl_PointCoord * 25.0)/0.5;

            // Create stronger center bias
            float centerBias = 1.0 - pow(dist * 2.0, 1.6);
            
            // Create clusters by combining noise with distance
            float cluster = noise * mix(0.01, 1.2, centerBias);
            
            // Threshold to create distinct particles
            if (cluster < 0.3) discard;

            
            // Increased initial brightness
            float strength = 1.0 - (dist * 1.67);
            strength = pow(strength, 1.2) * (noise * 0.3 + 0.7); // Less noise influence, brighter overall

            vec3 color1 = vec3(0.95, 0.65, 0.0);
            // Brighter color mix
            vec3 color = mix(vec3(1.2), color1, strength * 0.8);
            
            // Fade out alpha near edges
            float alpha = 1.0 - (dist / 0.6);
            alpha = pow(alpha, 0.5) * (centerBias * 0.7 + 0.3);
            
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </points>
  );
};

const Scene2 = () => {
  return (
    <Canvas
      style={{ width: "100vw", height: "100vh", background: "#000324" }}
      camera={{ position: [1.5, 1.5, 1.5] }}
    >
      <ambientLight intensity={0.5} />
      <BasicFirework />
      <OrbitControls autoRotate={false} />
    </Canvas>
  );
};

export default Scene2;
