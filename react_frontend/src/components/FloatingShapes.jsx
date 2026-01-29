import React from 'react';
import { Float, Sphere } from '@react-three/drei';

const FloatingShapes = () => {
  return (
    <group>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Sphere position={[4, 2, -2]} args={[0.5, 32, 32]}>
          <meshStandardMaterial
            color="#60a5fa"
            transparent
            opacity={0.6}
            roughness={0.1}
            metalness={0.8}
          />
        </Sphere>
      </Float>

      <Float speed={1.2} rotationIntensity={0.8} floatIntensity={2.5}>
        <Sphere position={[-2, 3, 0]} args={[0.4, 16, 16]}>
          <meshStandardMaterial
            color="#f59e0b"
            transparent
            opacity={0.6}
            roughness={0.3}
            metalness={0.7}
          />
        </Sphere>
      </Float>

      <Float speed={1.7} rotationIntensity={1.2} floatIntensity={1.6}>
        <Sphere position={[-3, 2, 2]} args={[0.35, 32, 32]}>
          <meshStandardMaterial
            color="#10b981"
            transparent
            opacity={0.7}
            roughness={0.2}
            metalness={0.7}
          />
        </Sphere>
      </Float>

      <Float speed={2.2} rotationIntensity={1.3} floatIntensity={1.2}>
        <Sphere position={[1, -2, -2]} args={[0.3, 32, 32]}>
          <meshStandardMaterial
            color="#f43f5e"
            transparent
            opacity={0.6}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      </Float>

      <Float speed={1.9} rotationIntensity={1.1} floatIntensity={1.4}>
        <Sphere position={[-1.5, 1.5, 1]} args={[0.25, 32, 32]}>
          <meshStandardMaterial
            color="#6366f1"
            transparent
            opacity={0.7}
            roughness={0.2}
            metalness={0.7}
          />
        </Sphere>
      </Float>
    </group>
  );
};

export default FloatingShapes;
