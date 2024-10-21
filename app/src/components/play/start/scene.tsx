'use client';
import { useMemo, useRef } from 'react';
import { OrbitControls, useGLTF } from '@react-three/drei';
import {
  InstancedRigidBodies,
  InstancedRigidBodyProps,
  Physics,
  RapierRigidBody,
  RigidBody,
} from '@react-three/rapier';
import * as THREE from 'three';

import { Perf } from 'r3f-perf';

const Scene: React.FC = () => {
  const dominosCount = 5;
  const { scene } = useGLTF('/models/dominos.glb');
  const domino = useRef<(RapierRigidBody | null)[]>([]);

  const dominosInstances = useMemo(() => {
    const instances: InstancedRigidBodyProps[] = [];
    for (let i = 0; i < dominosCount; i++) {
      instances.push({
        key: 'instance_' + i,
        position: [i * 0.8 + 0.5, -1, 1],
        rotation: [0, 0, 0],
        scale: 1,
      });
    }
    domino.current = instances.map(() => null);
    console.log(instances);
    return instances;
  }, []);

  const toppleDomino = (index: number, event: any) => {
    event.stopPropagation();
    console.log('topple clicked for index:', index);
    const currentDomino = domino.current[index];
    console.log('center of mass', currentDomino?.worldCom());
    if (currentDomino) {
      const com = currentDomino?.worldCom();
      const impulsePoint = new THREE.Vector3(0, 1, 0);
      const impulse = new THREE.Vector3(0, -1, 0);
      currentDomino.applyImpulseAtPoint(
        { x: 2, y: 0, z: 0 },
        { ...com, y: com.y + 0.6 },
        true
      );

      currentDomino.applyImpulse({ x: 1, y: -1, z: 0 }, true);
    }
  };

  return (
    <>
      <ambientLight />
      <Perf />

      <OrbitControls />

      <Physics debug>
        <RigidBody type="fixed">
          <mesh receiveShadow position={[0, -2, 0]}>
            <boxGeometry args={[10, 0.5, 10]} />
            <meshStandardMaterial color="lightblue" />
          </mesh>
        </RigidBody>

        {dominosInstances.map((instance, index) => (
          <RigidBody
            {...instance}
            key={'instance_' + index}
            ref={(el: RapierRigidBody | null) => {
              if (el) {
                domino.current[index] = el;
              }
            }}>
            <primitive
              object={scene.clone()}
              position={instance.position}
              onClick={(event: any) => toppleDomino(index, event)}
            />
          </RigidBody>
        ))}
      </Physics>
    </>
  );
};

export default Scene;
