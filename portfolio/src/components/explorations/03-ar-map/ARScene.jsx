"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import "./ARScene.css";
import "aframe";
import "mind-ar/dist/mindar-image-aframe.prod.js";

export default function ARScene() {
  const sceneRef = useRef(null);
  const sceneLoaded = useRef(false);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

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
      {/* <Script
        src="https://aframe.io/releases/1.5.0/aframe.min.js"
        strategy="beforeInteractive"
      /> */}
      {/* <Script
        src="https://cdn.jsdelivr.net/gh/donmccurdy/aframe-extras@v7.0.0/dist/aframe-extras.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js"
        strategy="beforeInteractive"
      /> */}

      <div className="h-dwh w-dvw">
        {showStartScreen ? (
          <div className="ar-start-screen">
            <button
              className="ar-start-button"
              onClick={requestCameraPermission}
            >
              Start AR Experience
            </button>
          </div>
        ) : (
          <>
            <div ref={sceneRef} className="ar-scene-container">
              <a-scene
                mindar-image="imageTargetSrc: /ar-targets/singing.mind;"
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

                <a-entity mindar-image-target="targetIndex: 0">
                  <a-text
                    value="sing[I]ng"
                    position="0 0.5 0"
                    rotation="0 0 0"
                    scale="1 1 1"
                    align="center"
                    color="#cccccc"
                  ></a-text>
                  <a-video
                    src="/ar-targets/singing.mp4"
                    position="0 0 0"
                    rotation="0 0 0"
                    width="0.552"
                    height="1"
                    play="true"
                  ></a-video>
                </a-entity>
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
