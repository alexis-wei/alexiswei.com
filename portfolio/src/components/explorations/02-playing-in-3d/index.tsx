"use client";
import { Canvas } from "@react-three/fiber";
import { DoubleSide } from "three";
import {
  DragControls,
  MeshTransmissionMaterial,
  Preload,
} from "@react-three/drei";

const GlassSphere = () => {
  return (
    <GlassObject>
      <sphereGeometry args={[1, 32]} />
    </GlassObject>
  );
};

const GlassCylinder = () => {
  return (
    <GlassObject>
      <cylinderGeometry args={[1, 1, 0.2, 32]} />
    </GlassObject>
  );
};

const GlassObject = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <DragControls>
        <mesh
          position={[0.2, -0.1, 1.5]}
          rotation-x={Math.PI / 2}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          {children}
          <MeshTransmissionMaterial
            ior={1.2}
            thickness={1}
            anisotropy={0.2}
            opacity={0.1}
            color="#b3e0ff"
            chromaticAberration={0.05}
          />
        </mesh>
        <Preload />
      </DragControls>
    </>
  );
};

const DirectionalLight = () => {
  const directionalLight = { x: 1, y: 1, z: 2 };
  return (
    <directionalLight
      position={[directionalLight.x, directionalLight.y, directionalLight.z]}
      intensity={5}
      color={"white"}
    />
  );
};

const Shaders = () => {
  const canvasSize = {
    width: "260px",
    height: "200px",
  };
  return (
    <div className="flex min-h-dvh w-dvw flex-col items-center justify-start gap-8 p-5 pb-32">
      <div className="flex h-fit w-full flex-col items-start gap-1 text-black">
        <h2 className="leading-none tracking-tighter">02-playing in 3d</h2>
        <p className="font-serif text-xs font-bold text-stone-600">11/21/24</p>
        <p className="max-w-[400px] text-sm tracking-tighter">
          from setting up a scene in 3js to how to use shaders. a wide range of
          topics with so many variables to think through. trying to explore how
          to make realistic effects through combining tools and available
          libraries such as react 3 fiber and drei, trying to understand how
          each parameter can change the effects
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <h6>draggable glass study</h6>

        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <Canvas style={canvasSize}>
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[1, 32]} />
                <meshStandardMaterial color="#52df7a" metalness={0} />
              </mesh>
              <mesh rotation={[0, 0, 0]}>
                <planeGeometry args={[12, 10]} />
                <meshStandardMaterial
                  color="#ffffff"
                  metalness={0} // Change from 1 to 0
                  roughness={0.5}
                  side={DoubleSide}
                />
              </mesh>
              <GlassSphere />
              <ambientLight intensity={3} />
              <DirectionalLight />
            </Canvas>
            <p className="absolute left-3 top-2 font-mono text-xs">
              spherical mesh
            </p>
          </div>
          <div className="relative">
            <Canvas style={canvasSize}>
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[1, 32]} />
                <meshStandardMaterial color="#52df7a" metalness={0} />
              </mesh>
              <mesh rotation={[0, 0, 0]}>
                <planeGeometry args={[12, 10]} />
                <meshStandardMaterial
                  color="#ffffff"
                  metalness={0} // Change from 1 to 0
                  roughness={0.5}
                  side={DoubleSide}
                />
              </mesh>
              <GlassCylinder />
              <ambientLight intensity={3} />
              <DirectionalLight />
            </Canvas>
            <p className="absolute left-3 top-2 font-mono text-xs">
              cylindrical mesh
            </p>
          </div>
        </div>
        <p className="max-w-[500px] text-sm tracking-tighter">
          in the 3d world, you <i>actually</i> have to switch your brain to
          think about the third dimension. the physical shape of an object
          largely changes what you see on screen and the effect lighting has on
          it. with the same exact materials applied to a sphere vs a cylinder,
          the shape changes if there is glass distortion vs not
        </p>
      </div>
    </div>
  );
};

export default Shaders;
