"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

interface MeshComponentProps {
  gltfModel: object;
}

const MeshComponent: React.FC<MeshComponentProps> = ({ gltfModel }) => {
  const mesh = useRef<Mesh>(null!);

  useFrame((_, delta) => {
    mesh.current.rotation.y += delta * 0.2;
  });

  return (
    <mesh ref={mesh} rotation={[0.1, 0.3, 0.7]}>
      <primitive object={gltfModel} />
    </mesh>
  );
};

export default MeshComponent;
