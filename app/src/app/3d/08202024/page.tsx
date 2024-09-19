"use client";

import * as THREE from "three";
import { useEffect } from "react";

export default function One() {
  useEffect(() => {
    const sizes = {
      width: 800,
      height: 600,
    };
    const scene = new THREE.Scene();
    const cube = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: "#ce2f2f",
      wireframe: true,
    });
    const mesh = new THREE.Mesh(cube, material);
    scene.add(mesh);

    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    camera.position.z = 3;
    scene.add(camera);
    const canvas = document.querySelector("canvas.webgl");
    if (canvas) {
      const renderer = new THREE.WebGLRenderer({ canvas });
      renderer.setSize(sizes.width, sizes.height);
      renderer.render(scene, camera);
    }
  }, []);

  return <canvas className="webgl"></canvas>;
}
