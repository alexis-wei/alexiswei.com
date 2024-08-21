"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import MeshComponent from "./Mesh";
import { Box, Center, Loader, Transition } from "@mantine/core";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const Saturn = () => {
  const [gltf, setGltf] = useState<GLTF | null>(null);
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load("/saturn/scene.gltf", (gltf) => {
      setGltf(gltf);
    });
  }, []);

  return (
    <Box h="120px" w="240px" pos="relative">
      <Transition
        mounted={!gltf}
        transition="fade"
        duration={1000}
        timingFunction="cubic-bezier(0.0, 0.15, 0.4, 1)">
        {(style) => (
          <Center pos="absolute" inset={0} style={style}>
            <Loader color="dark.7" size="sm" type="dots" />
          </Center>
        )}
      </Transition>
      <Transition
        mounted={!!gltf}
        transition="fade"
        duration={3000}
        timingFunction="cubic-bezier(0, 0.05, 0.3, 1)"
        exitDelay={300}
        enterDelay={500}>
        {(styles) => (
          <Canvas
            style={{
              ...styles,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}>
            <ambientLight color="#fcf9ea" />
            <directionalLight
              color="#f3ecd1"
              position={[0, 3, 5]}
              intensity={1}
            />
            <directionalLight
              color="#fff"
              position={[-1, 5, 0]}
              intensity={1}
            />
            <directionalLight
              color="#fff"
              position={[-2, 3, 2]}
              intensity={1}
            />
            {gltf && <MeshComponent gltfModel={gltf.scene} />}
          </Canvas>
        )}
      </Transition>
    </Box>
  );
};
export default Saturn;
