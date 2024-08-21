"use client";

import { Canvas, useLoader } from "@react-three/fiber";
import { useEffect, useState } from "react";
import MeshComponent from "./Mesh";
import { Box, Group, Loader, Transition } from "@mantine/core";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const Saturn = () => {
  const [visible, setVisible] = useState(false);
  const [modelIsLoaded, setModelIsLoaded] = useState(false);
  const fileUrl = "/saturn/scene.gltf";
  const gltf = useLoader(GLTFLoader, fileUrl);

  useEffect(() => {
    if (modelIsLoaded) setVisible(true);
    if (gltf) setModelIsLoaded(true);
  }, [gltf, modelIsLoaded]);

  return (
    <Box h="120px" w="240px">
      <Transition
        mounted={!visible}
        transition="fade"
        duration={1000}
        timingFunction="cubic-bezier(0.0, 0.15, 0.4, 1)">
        {(styles) => (
          <Group
            h="120"
            w="240"
            style={{ ...styles, position: "absolute" }}
            justify="center"
            align="center">
            <Loader color="dark.7" size="sm" type="dots" />
          </Group>
        )}
      </Transition>
      <Transition
        mounted={visible}
        transition="fade"
        duration={3000}
        timingFunction="cubic-bezier(0, 0.05, 0.3, 1)"
        exitDelay={300}
        enterDelay={500}>
        {(styles) => (
          <Canvas
            style={{
              ...styles,
              height: "120px",
              width: "240px",
              position: "absolute",
            }}>
            <ambientLight color="#fcf9ea" />
            <directionalLight
              color="#f3ecd1"
              position={[0, 3, 5]}
              intensity={1}
            />
            <directionalLight
              color="##fff"
              position={[-1, 5, 0]}
              intensity={1}
            />
            <directionalLight
              color="##fff"
              position={[-2, 3, 2]}
              intensity={1}
            />
            <MeshComponent gltfModel={gltf.scene} />
          </Canvas>
        )}
      </Transition>
    </Box>
  );
};
export default Saturn;
