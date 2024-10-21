import { ReactThreeFiber } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<
        OrbitControls,
        typeof OrbitControls
      >;
    }
  }
}
