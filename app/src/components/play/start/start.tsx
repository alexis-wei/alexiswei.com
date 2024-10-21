'use client';
import { Canvas } from '@react-three/fiber';
import Scene from './scene';

const Start: React.FC = () => {
  return (
    <div style={{ height: '100vh' }}>
      <Canvas shadows camera={{ position: [0, 0, 10] }}>
        <Scene />
      </Canvas>
    </div>
  );
};

export default Start;
