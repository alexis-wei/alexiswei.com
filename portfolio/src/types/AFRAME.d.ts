declare namespace JSX {
  interface IntrinsicElements {
    "a-scene": any;
    "a-assets": any;
    "a-asset-item": any;
    "a-marker": any;
    "a-entity": any;
    "a-text": any;
    "a-camera": any;
  }
}

interface AFrameComponent {
  el: HTMLElement;
}

declare namespace AFRAME {
  function registerComponent(
    name: string,
    component: {
      init?: (this: AFrameComponent) => void;
      update?: (this: AFrameComponent) => void;
      tick?: (this: AFrameComponent) => void;
      remove?: (this: AFrameComponent) => void;
      pause?: (this: AFrameComponent) => void;
      play?: (this: AFrameComponent) => void;
    },
  ): void;

  interface System {
    start(): void;
    stop(): void;
  }

  interface Entity extends HTMLElement {
    systems: {
      [key: string]: System;
    };
    hasLoaded: boolean;
    sceneEl: Entity;
  }
}

interface Window {
  AFRAME: typeof AFRAME;
  MINDAR: any;
}

declare global {
  interface Document {
    querySelector(selectors: "a-scene"): AFRAME.Entity | null;
  }
}
