import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Starfield({ count = 800 }) {
  const pointsRef = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const color1 = new THREE.Color('#3b82f6'); // blue
    const color2 = new THREE.Color('#06b6d4'); // cyan
    const color3 = new THREE.Color('#8b5cf6'); // purple

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25 - 5;

      const chosenColor = Math.random() > 0.6 ? color3 : (Math.random() > 0.3 ? color2 : color1);
      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.02;
      pointsRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function CoreGeometricNexus() {
  const meshRef = useRef();
  const innerRef = useRef();
  const ringRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Mouse influence
    const mx = state.pointer.x * 0.5;
    const my = state.pointer.y * 0.5;

    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.25;
      meshRef.current.rotation.y += delta * 0.35;
      meshRef.current.position.y = Math.sin(time * 1.2) * 0.15;
      meshRef.current.rotation.z = mx * 0.3;
    }

    if (innerRef.current) {
      innerRef.current.rotation.x -= delta * 0.4;
      innerRef.current.rotation.y += delta * 0.5;
      innerRef.current.position.y = Math.sin(time * 1.5) * 0.1;
    }

    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 3 + my * 0.2;
      ringRef.current.rotation.y += delta * 0.15;
      ringRef.current.rotation.z = time * 0.1 + mx * 0.2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Holographic Wireframe Icosahedron */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.8, 1]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#1d4ed8"
          emissiveIntensity={0.6}
          wireframe
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Inner Glowing Crystal Octahedron */}
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={1.2}
          wireframe={false}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Futuristic Orbiting Torus Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2.8, 0.04, 16, 100]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#7c3aed"
          emissiveIntensity={1.5}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
    </group>
  );
}

export function FloatingDebrisField({ count = 14 }) {
  const groupRef = useRef();

  const debris = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      // Keep center clear: place debris exclusively on outer left & right perimeter
      const side = i % 2 === 0 ? 1 : -1;
      const posX = side * (3.8 + Math.random() * 4.2);
      const posY = (Math.random() - 0.5) * 8;
      const posZ = (Math.random() - 0.5) * 6 - 1;

      return {
        position: [posX, posY, posZ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: 0.15 + Math.random() * 0.22,
        speed: 0.2 + Math.random() * 0.35,
        color: i % 3 === 0 ? '#3b82f6' : (i % 3 === 1 ? '#06b6d4' : '#8b5cf6'),
        type: i % 3,
      };
    });
  }, [count]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    groupRef.current.children.forEach((child, i) => {
      const d = debris[i];
      child.rotation.x += delta * d.speed;
      child.rotation.y += delta * d.speed * 0.8;
      child.position.y = d.position[1] + Math.sin(time * d.speed + i) * 0.25;
    });
  });

  return (
    <group ref={groupRef}>
      {debris.map((d, i) => (
        <mesh key={i} position={d.position} rotation={d.rotation} scale={d.scale}>
          {d.type === 0 && <tetrahedronGeometry args={[1, 0]} />}
          {d.type === 1 && <boxGeometry args={[1, 1, 1]} />}
          {d.type === 2 && <dodecahedronGeometry args={[0.9, 0]} />}
          <meshStandardMaterial
            color={d.color}
            emissive={d.color}
            emissiveIntensity={0.5}
            wireframe
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

