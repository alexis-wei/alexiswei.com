"use client";
import { useEffect, useRef, useState } from "react";
import "./ARScene.css";
import "aframe";
import "mind-ar/dist/mindar-image-aframe.prod.js";

const polaroids = [
  {
    text: "photograph[y]",
    videoSrc: "/ar-targets/photography.mp4",
    width: 1.125,
    height: 2,
    letterIndex: 0,
  },
  {
    text: "s[i]nging",
    videoSrc: "/ar-targets/singing.mp4",
    width: 1.134,
    height: 2,
    letterIndex: 1,
  },
];

export default function ARScene() {
  const sceneRef = useRef(null);
  const sceneLoaded = useRef(false);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [currentlyScanned, setCurrentlyScanned] = useState(1000);

  const addEventListeners = () => {
    console.log("add event listeners called");

    if (!sceneRef.current) {
      console.log("not current scene");
    }

    setTimeout(() => {
      // Wait for scene to load before adding listeners
      const scene = sceneRef.current.querySelector("a-scene");

      scene.addEventListener("arReady", () => {
        console.log("arReady get called");
        const target0 = sceneRef.current.querySelector("#target-0");
        const target1 = sceneRef.current.querySelector("#target-1");

        if (!target0) {
          console.log("target 0 not found");
        }

        if (!target1) {
          console.log("target 1 not found");
        }

        target0.addEventListener("targetFound", (event) => {
          console.log("target 0 found");
          setCurrentlyScanned(0);
        });

        target0.addEventListener("targetLost", (event) => {
          console.log("target 0 lost");
          setCurrentlyScanned(1000);
        });

        target1.addEventListener("targetFound", (event) => {
          console.log("target 1 found");
          setCurrentlyScanned(1);
        });

        target1.addEventListener("targetLost", (event) => {
          console.log("target 1 lost");
          setCurrentlyScanned(1000);
        });
      }); // Add event listeners after scene is loaded
    }, 200);
  };

  const handleStartAR = async () => {
    try {
      await requestCameraPermission();
      addEventListeners();
    } catch (error) {
      console.log(error);
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop()); // Stop the stream immediately
      setPermissionGranted(true);
      setShowStartScreen(false);
    } catch (error) {
      console.error("Error getting camera permission:", error);
      alert("Camera permission is required to use AR features");
    }
  };

  const stopAR = () => {
    setShowStartScreen(true);
    if (sceneRef.current) {
      // Stop any ongoing AR sessions
      const scene = sceneRef.current.querySelector("a-scene");
      if (scene) {
        scene.systems["mindar-image-system"]?.pause();
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !sceneLoaded.current) {
      const initScene = () => {
        if (window.AFRAME && window.MINDAR && !sceneLoaded.current) {
          sceneLoaded.current = true;
        }
      };

      if (window.AFRAME) {
        initScene();
      }
    }
  }, []);

  return (
    <>
      <div ref={sceneRef} className="h-dwh w-dvw">
        {showStartScreen ? (
          <div className="ar-start-screen">
            <button className="ar-start-button" onClick={handleStartAR}>
              Start AR Experience
            </button>
          </div>
        ) : (
          <>
            <div className="ar-scene-container">
              <a-scene
                mindar-image="imageTargetSrc: /ar-targets/targets.mind;"
                color-space="sRGB"
                renderer="colorManagement: true, physicallyCorrectLights"
                vr-mode-ui="enabled: false"
                device-orientation-permission-ui="enabled: false"
              >
                <a-assets>
                  <a-asset-item
                    id="raccoonModel"
                    src="https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/band-example/raccoon/scene.gltf"
                  ></a-asset-item>
                </a-assets>

                <a-camera
                  position="0 0 0"
                  look-controls="enabled: false"
                ></a-camera>

                {polaroids.map((polaroid, index) => (
                  <a-entity
                    key={index}
                    id={`target-${index}`}
                    mindar-image-target={`targetIndex: ${index}`}
                  >
                    <a-text
                      value={polaroid.text}
                      position="0 1.5 0"
                      rotation="0 0 0"
                      scale="1 1 1"
                      align="center"
                      color="#ffffff"
                      shadow="cast: true; receive: true"
                    ></a-text>
                    <a-video
                      src={polaroid.videoSrc}
                      position="0 -0.5 0"
                      rotation="0 0 0"
                      width={polaroid.width}
                      height={polaroid.height}
                      play={currentlyScanned === index}
                    ></a-video>
                  </a-entity>
                ))}
                {/* <a-entity mindar-image-target="targetIndex: 1">
                  <a-text
                    value="photograph[y]"
                    position="0 0.5 0"
                    rotation="0 0 0"
                    scale="1 1 1"
                    align="center"
                    color="#cccccc"
                  ></a-text>
                  <a-video
                    src="/ar-targets/photography.mp4"
                    position="0 0 0"
                    rotation="0 0 0"
                    width="0.552"
                    height="1"
                    play="false"
                  ></a-video>
                </a-entity> */}
              </a-scene>
            </div>
            <button className="ar-stop-button" onClick={stopAR}>
              Stop AR
            </button>
          </>
        )}
      </div>
    </>
  );
}
