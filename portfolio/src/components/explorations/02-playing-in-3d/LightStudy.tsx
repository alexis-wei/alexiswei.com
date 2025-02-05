import {
  MeshTransmissionMaterial,
  Preload,
  useHelper,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { SpotLight, SpotLightHelper } from "three";
import { MutableRefObject, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { useAnimationFrame } from "motion/react";
import { DescriptionText } from "../ui";

function GlassPyramid() {
  const [rotationY, setRotationY] = useState(0);

  useFrame((state) => {
    setRotationY(state.clock.getElapsedTime() % (2 * Math.PI));
  });

  const materialConfig = {
    color: "#ffffff",
    attenuationColor: "#ffffff",
    ior: 3,
    thickness: 7,
    resolution: 256,
    transmission: 1,
    attenuationDistance: 5,
    chromaticAberration: 0.8,
    roughness: 0.1,
  };

  return (
    <>
      <mesh
        position={[0, 0, 0]}
        rotation-y={rotationY}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <coneGeometry args={[1, 2, 5]} />
        <MeshTransmissionMaterial {...materialConfig} />
      </mesh>
      <Preload />
    </>
  );
}

const DirectionalLight = () => {
  const directionalLight = { x: 0, y: -0.5, z: 2 };
  return (
    <directionalLight
      position={[directionalLight.x, directionalLight.y, directionalLight.z]}
      intensity={2}
      color={"#ffffff"}
    />
  );
};

interface SpotlightProps {
  x: number;
  y: number;
}

function Spotlight(props: SpotlightProps) {
  const spotlightRef1 = useRef<SpotLight>(null);
  const spotlightRef2 = useRef<SpotLight>(null);
  useHelper(
    spotlightRef1 as MutableRefObject<SpotLight>,
    SpotLightHelper,
    "#aba8a8",
  );

  useHelper(
    spotlightRef2 as MutableRefObject<SpotLight>,
    SpotLightHelper,
    "#aba8a8",
  );

  const defaultValues = {
    intensity: 390,
    decay: 2,
    angle: 0.65,
    penumbra: 1,
  };

  return (
    <>
      <spotLight
        ref={spotlightRef1}
        position={[props.x, props.y, 0.5]}
        {...defaultValues}
        color={"#00ffff"}
      />
      <spotLight
        ref={spotlightRef2}
        position={[-props.x, props.y, 0.5]}
        {...defaultValues}
        color={"#cdff07"}
      />
    </>
  );
}

export default function LightStudy() {
  const [spotlightXPos, setSpotlightXPos] = useState<number>(3);
  const [spotlightYPos, setSpotlightYPos] = useState<number>(1);
  const [settingX, setSettingX] = useState<boolean>(true);

  const [lastSwitchedTime, setLastSwitchedTime] = useState<number>(0);

  useAnimationFrame((time) => {
    if (settingX === true) {
      setSpotlightXPos(
        Number((Math.sin(time * ((2 * Math.PI) / 6000)) * 3 + 3).toFixed(2)),
      );
    } else {
      setSpotlightYPos(
        Number((Math.sin(time * ((2 * Math.PI) / 6000)) * 2 + 1).toFixed(2)),
      );
    }

    if (time - lastSwitchedTime > 6000) {
      setSettingX(!settingX);
      setLastSwitchedTime(time);
    }
  });

  const canvasSize = {
    width: "260px",
    height: "200px",
  };

  return (
    <div className="flex flex-col gap-2">
      <h6>spotlight study</h6>
      <div className="flex flex-wrap gap-4">
        <div className="relative">
          <Canvas style={canvasSize}>
            <mesh position={[0, 2, -5]}>
              <planeGeometry args={[20, 12]} />
              <meshStandardMaterial color="#fff" roughness={0.2} />
            </mesh>
            <mesh position={[0, -3, 0]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[20, 10]} />
              <meshStandardMaterial color="#fff" />
            </mesh>
            <GlassPyramid />
            <DirectionalLight />
            <Spotlight x={spotlightXPos} y={spotlightYPos} />
          </Canvas>

          <p className="absolute left-3 top-2 font-mono text-xs">
            pentagonal-pyramid
          </p>
        </div>
        <div className="flex w-[260px] flex-col px-3 py-2">
          <p className="font-mono text-xs">spotlight position:</p>
          <div className="flex w-full items-center gap-2">
            <h6>x:</h6>
            <span className="text-xs font-medium">0</span>
            <Slider
              value={[spotlightXPos]}
              min={0}
              max={6}
              step={0.01}
              className="disabled w-full"
            />
            <span className="text-xs font-medium">6</span>
          </div>
          <div className="flex w-full items-center gap-2">
            <h6>y:</h6>
            <span className="text-xs font-medium">-1</span>
            <Slider
              value={[spotlightYPos]}
              min={-1}
              max={3}
              step={0.01}
              className="disabled w-full"
            />
            <span className="text-xs font-medium">3</span>
          </div>
        </div>
      </div>
      <DescriptionText>
        moving light effect. i spent about 3 hours trying to get the spotlight
        to look like the beam of light on the &apos;dark side of the moon&apos;
        album cover but didn&apos;t quite go as expected. however end up with
        this very cool spotlight experiment that i&apos;m happy with and
        experimented with material properties. you can follow visually where the
        lights are with the gray helper outlines and see them move in real time
      </DescriptionText>
      <DescriptionText>
        also learned that pyramids are really just cones with less radial
        segments
      </DescriptionText>
    </div>
  );
}
