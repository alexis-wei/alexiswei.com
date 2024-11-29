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
  const [puzzleStatus, setPuzzleStatus] = useState(Array(7).fill(false));

  let targets = [];
  const addEventListeners = () => {
    console.log("add event listeners called");

    if (!sceneRef.current) {
      console.log("not current scene");
      return;
    }

    setTimeout(() => {
      // Wait for scene to load before adding listeners
      const scene = sceneRef.current.querySelector("a-scene");

      scene.addEventListener("arReady", () => {
        console.log("arReady get called");

        // Pre-load and pause all videos
        polaroids.forEach((_, i) => {
          const videoEntity = sceneRef.current.querySelector(`#video-${i}`);
          if (videoEntity) {
            const videoEl = videoEntity.components.material.material.map.image;
            if (videoEl) {
              videoEl.play().catch(() => {});
              videoEl.pause();
            }
          }
        });
        targets = Array.from({ length: polaroids.length }, (_, i) => {
          const target = sceneRef.current.querySelector(`#target-${i}`);
          target.addEventListener("targetFound", () => {
            console.log(`target ${i} found`);
            setCurrentlyScanned(i);
            // Explicitly handle video playback
            const videoEntity = sceneRef.current.querySelector(`#video-${i}`);
            if (videoEntity) {
              const videoEl =
                videoEntity.components.material.material.map.image;
              if (videoEl) {
                videoEl.play().catch(console.error);
              }
            }
          });

          target.addEventListener("targetLost", () => {
            console.log(`target ${i} lost`);
            setCurrentlyScanned(1000);
            const videoEntity = sceneRef.current.querySelector(`#video-${i}`);
            if (videoEntity) {
              const videoEl =
                videoEntity.components.material.material.map.image;
              if (videoEl) {
                videoEl.pause();
              }
            }
          });

          return target;
        });
      });
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
          <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-12 bg-[#FDF7E9] text-center">
            <h5 className="text-center font-normal">
              welcome to <br />
              <i>ying's ar puzzle</i>
            </h5>
            <p className="w-[280px] text-sm font-semibold">
              Ying’s our favourite girlie with a million hobbies, find all
              pieces of her that we know and love to complete the puzzle
            </p>
            <div className="flex gap-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#AFA794]">
                <h3 className="leading-none">y</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#AFA794]">
                <h3 className="leading-none">i</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#AFA794]">
                <h3 className="leading-none">n</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#AFA794]">
                <h3 className="leading-none">g</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#AFA794]">
                <h3 className="leading-none">-</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#AFA794]">
                <h3 className="leading-none">g</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#AFA794]">
                <h3 className="leading-none">e</h3>
              </div>
            </div>
            <div className="flex w-[260px] flex-col items-start gap-1 text-start">
              <p className="text-sm font-semibold">instructions:</p>
              <p className="text-xs">
                scattered around the venue are polaroids of Ying, turn on the AR
                scanner using the button below and scan away :)
              </p>
            </div>
            <button
              className="rounded-lg border border-[#595447] bg-[#AFA794] px-12 py-2 font-serif font-bold text-white"
              onClick={handleStartAR}
            >
              enter AR
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
                      id={`video-${index}`}
                      src={polaroid.videoSrc}
                      position="0 -0.5 0"
                      rotation="0 0 0"
                      width={polaroid.width}
                      height={polaroid.height}
                      playsinline // Add this
                      webkit-playsinline // Add this
                      crossorigin="anonymous" // Add this
                    ></a-video>
                  </a-entity>
                ))}
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
