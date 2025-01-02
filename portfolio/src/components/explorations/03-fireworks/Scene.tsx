"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { BufferGeometry, Points } from "three";

const BasicParticles = () => {
  // This reference gives us direct access to our points
  const points = useRef<Points<BufferGeometry>>(null);

  // You can see that, like our mesh, points also takes a geometry and a material,
  // but a specific material => pointsMaterial
  return (
    <points ref={points}>
      <sphereGeometry args={[1, 36, 12]} />

      {/* <pointsMaterial color="#5786F5" size={0.05} sizeAttenuation /> */}
      <shaderMaterial
        transparent
        uniforms={{
          size: { value: 0.1 }, // Increased base size
          scale: { value: window.innerHeight / 2 }, // Scale factor based on screen size
        }}
        vertexShader={`
          uniform float scale;
          uniform float size;
          
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            
            // Proper size attenuation
            gl_PointSize = size * (scale / length(mvPosition.xyz));
          }
        `}
        fragmentShader={`
          void main() {
            // Calculate distance from center of point
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);
            
            // Discard pixels outside of circle
            if (dist > 0.5) discard;
            
            // Create smooth glow effect
            float strength = 1.0 - (dist * 1.67);
            strength = pow(strength, 2.0);
            

            // For a multi-color glow:
            vec3 cyan = vec3(0, 0.95, 0.95);  // cyan
            vec3 color = mix(vec3(1.0), cyan, strength);
            
            // Fade out alpha near edges
            float alpha = 1.0 - (dist / 0.6);
            alpha = pow(alpha, 0.5); // Soften the alpha falloff
            
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </points>
  );
};

const Scene = () => {
  return (
    <Canvas
      style={{ width: "100vw", height: "100vh" }}
      camera={{ position: [1.5, 1.5, 1.5] }}
    >
      <ambientLight intensity={0.5} />
      <BasicParticles />
      <OrbitControls autoRotate={false} />
    </Canvas>
  );
};

export default Scene;
