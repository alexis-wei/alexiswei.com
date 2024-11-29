/* eslint-disable */

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
    letterFound: "y",
  },
  {
    text: "s[i]nging",
    videoSrc: "/ar-targets/singing.mp4",
    width: 1.134,
    height: 2,
    letterFound: "i",
  },
  {
    text: "hosti[n]g",
    videoSrc: "/ar-targets/hosting.mp4",
    width: 1.134,
    height: 2,
    letterFound: "n",
  },
  {
    text: "skatin[g]",
    videoSrc: "/ar-targets/skating.mp4",
    width: 1.134,
    height: 2,
    letterFound: "g",
  },
  {
    text: "[dog momming]",
    videoSrc: "/ar-targets/dog-mom.mp4",
    width: 1.134,
    height: 2,
    letterFound: " 🐶",
  },
  {
    text: "cookin[g]",
    videoSrc: "/ar-targets/cooking.mp4",
    width: 1.134,
    height: 2,
  },
  {
    text: "danc[e]",
    videoSrc: "/ar-targets/dance.mp4",
    width: 1.134,
    height: 2,
    letterFound: "e",
  },
];

export default function ARScene() {
  const sceneRef = useRef(null);
  const sceneLoaded = useRef(false);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [currentlyScanned, setCurrentlyScanned] = useState(1000);
  const [puzzleStatus, setPuzzleStatus] = useState(() => {
    // Check localStorage on initial load
    const savedStatus = localStorage.getItem("puzzleStatus");
    return savedStatus ? JSON.parse(savedStatus) : Array(7).fill(false);
  });

  let targets = [];

  const pauseAllVideos = () => {
    polaroids.forEach((_, i) => {
      const videoEntity = sceneRef.current.querySelector(`#video-${i}`);
      if (videoEntity) {
        const videoEl = videoEntity.components.material.material.map.image;
        if (videoEl) {
          // Force video to load but stay paused
          videoEl.load();
          videoEl.pause();
          videoEl.currentTime = 0;
          // Prevent autoplay
          videoEl.setAttribute("playsinline", "");
          videoEl.setAttribute("webkit-playsinline", "");
          videoEl.autoplay = false;
        }
      }
    });
  };

  const addEventListeners = () => {
    console.log("add event listeners called");

    if (!sceneRef.current) {
      console.log("not current scene");
      return;
    }
    pauseAllVideos();

    setTimeout(() => {
      // Wait for scene to load before adding listeners
      const scene = sceneRef.current.querySelector("a-scene");
      pauseAllVideos();
      scene.addEventListener("arReady", () => {
        targets = Array.from({ length: polaroids.length }, (_, i) => {
          const target = sceneRef.current.querySelector(`#target-${i}`);
          target.addEventListener("targetFound", () => {
            console.log(`target ${i} found`);
            setCurrentlyScanned(i);
            // Pause all other videos first
            pauseAllVideos();
            // Update puzzle status and local storage
            setPuzzleStatus((prev) => {
              const newStatus = [...prev];
              if (!prev[i] && polaroids[i].letterFound) {
                const foundText = sceneRef.current
                  .querySelector(`#target-${i}`)
                  .appendChild(document.createElement("a-text"));
                foundText.setAttribute(
                  "value",
                  `you found "${polaroids[i].letterFound}"!`,
                );
                foundText.setAttribute("position", "0 -1 0");
                foundText.setAttribute("align", "center");
                foundText.setAttribute("color", "#ffffff");
                foundText.setAttribute("scale", "0.8 0.8 0.8");
                setTimeout(() => {
                  foundText.remove();
                }, 2000);
              }
              newStatus[i] = true;
              localStorage.setItem("puzzleStatus", JSON.stringify(newStatus));
              return newStatus;
            });
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

  const handleReset = () => {
    setPuzzleStatus(Array(7).fill(false));
    localStorage.setItem("puzzleStatus", JSON.stringify(Array(7).fill(false)));
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
      pauseAllVideos();
      // Stop any ongoing AR sessions
      const scene = sceneRef.current.querySelector("a-scene");
      if (scene) {
        // Remove all existing UI elements first
        const existingUIs = document.querySelectorAll(
          ".mindar-ui-overlay, .mindar-ui-scanning",
        );
        existingUIs.forEach((ui) => ui.remove());

        // Stop the AR system
        if (scene.systems["mindar-image-system"]) {
          scene.systems["mindar-image-system"].stop();
        }
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
    return () => {
      stopAR();
    };
  }, []);

  return (
    <>
      <div ref={sceneRef} className="h-dwh w-dvw">
        {showStartScreen ? (
          <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-12 bg-[#FDF7E9] text-center">
            <h5 className="text-center font-normal">
              welcome to <br />
              <i>ying&apos;s ar puzzle</i>
            </h5>
            <p className="w-[280px] text-sm font-semibold">
              Ying’s our favourite girlie with a million hobbies, find all
              pieces of her that we know and love to complete the puzzle
            </p>

            <div className="flex gap-1">
              {["y", "i", "n", "g", "🐶", "g", "e"].map((letter, index) => (
                <div
                  key={index}
                  className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#AFA794]"
                >
                  <h3
                    className={`leading-none ${
                      puzzleStatus[index] ? "" : "hidden"
                    }`}
                  >
                    {letter}
                  </h3>
                </div>
              ))}
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
            <button
              className="px-4 font-serif text-xs font-bold text-[#595447]"
              onClick={handleReset}
            >
              reset
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
                autostart="false"
              >
                <a-assets>
                  <a-asset-item
                    id="libreBaskerville"
                    src="/fonts/libre_baskerville_bold.json"
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
                      position="0 0.8 0"
                      rotation="0 0 0"
                      scale="1 1 1"
                      align="center"
                      color="#ffffff"
                      shadow="cast: true; receive: true"
                    ></a-text>
                    <a-video
                      id={`video-${index}`}
                      src={polaroid.videoSrc}
                      position="0 -0.4 0"
                      rotation="0 0 0"
                      width={polaroid.width}
                      height={polaroid.height}
                      playsinline // Add this
                      webkit-playsinline // Add this
                      autoplay="false"
                      crossorigin="anonymous" // Add this
                    ></a-video>
                  </a-entity>
                ))}
              </a-scene>
            </div>
            <button
              className="fixed bottom-5 left-1/2 z-[9999] -translate-x-1/2 cursor-pointer rounded-lg border border-red-600 bg-red-500 px-12 py-2 font-serif font-bold text-white hover:bg-red-700"
              onClick={stopAR}
            >
              pause AR
            </button>
          </>
        )}
      </div>
    </>
  );
}
