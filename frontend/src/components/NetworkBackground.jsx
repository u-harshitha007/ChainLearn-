import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 60 }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const speed = 0.02 + Math.random() * 0.04;
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 25;
      temp.push({ t, speed, x, y, z });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    particles.forEach((particle, i) => {
      particle.t += particle.speed * 0.03;
      const currentT = particle.t;
      const posX = particle.x + Math.sin(currentT) * 0.8;
      const posY = particle.y + Math.cos(currentT * 0.6) * 0.8;
      const posZ = particle.z + Math.sin(currentT * 0.9) * 0.6;
      
      dummy.position.set(posX, posY, posZ);
      dummy.rotation.set(currentT * 0.1, currentT * 0.15, 0);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <octahedronGeometry args={[0.15, 0]} />
      <meshBasicMaterial color="#92400e" transparent opacity={0.12} wireframe />
    </instancedMesh>
  );
}

export default function NetworkBackground() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 22], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <Particles count={50} />
      </Canvas>
    </div>
  );
}
