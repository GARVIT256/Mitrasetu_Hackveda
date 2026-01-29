import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';

// Example 3D objects
function TorusKnot({ color = '#7f5fff' }) {
  const mesh = useRef();
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.x = clock.getElapsedTime() * 0.4;
      mesh.current.rotation.y = clock.getElapsedTime() * 0.6;
    }
  });
  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <torusKnotGeometry args={[1.2, 0.4, 128, 32]} />
      <meshPhysicalMaterial color={color} roughness={0.2} metalness={0.8} clearcoat={1} clearcoatRoughness={0.1} />
    </mesh>
  );
}

function Sphere({ color = '#5fffd7' }) {
  const mesh = useRef();
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.y = clock.getElapsedTime() * 0.7;
      mesh.current.position.y = Math.sin(clock.getElapsedTime()) * 0.2;
    }
  });
  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <sphereGeometry args={[1.1, 64, 64]} />
      <meshPhysicalMaterial color={color} roughness={0.15} metalness={0.7} clearcoat={1} clearcoatRoughness={0.1} />
    </mesh>
  );
}

function Box({ color = '#ff5f7f' }) {
  const mesh = useRef();
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.x = clock.getElapsedTime() * 0.5;
      mesh.current.rotation.z = clock.getElapsedTime() * 0.3;
    }
  });
  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshPhysicalMaterial color={color} roughness={0.25} metalness={0.8} clearcoat={1} clearcoatRoughness={0.1} />
    </mesh>
  );
}

// Main Section3DCanvas component
export default function Section3DCanvas({ type = 'torus', color = '#7f5fff', style = {} }) {
  let Object3D;
  if (type === 'sphere') Object3D = Sphere;
  else if (type === 'box') Object3D = Box;
  else Object3D = TorusKnot;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', ...style }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <Object3D color={color} />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}
