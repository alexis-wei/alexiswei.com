import { Canvas } from "@react-three/fiber";
import MeshComponent from "./Mesh";
// import { PerspectiveCamera } from "@react-three/drei";

export default function Saturn() {
  return (
    <Canvas style={{ height: "120px", width: "240px" }}>
      <ambientLight color="#fcf9ea" />
      <directionalLight color="#fde99c" position={[0, 5, 40]} />
      <MeshComponent />z
    </Canvas>
  );
}
