import { Clone, useGLTF } from '@react-three/drei';

import { Suspense } from 'react';
const Domino: React.FC = () => {
  const model = useGLTF('/models/dominos.glb');
  return (
    <>
      <Suspense>
        <Clone object={model.scene} />
      </Suspense>
    </>
  );
};

export default Domino;
