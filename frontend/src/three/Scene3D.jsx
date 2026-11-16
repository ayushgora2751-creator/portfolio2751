import React, { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Starfield, FloatingDebrisField } from './FloatingObjects';

function CameraRig() {
  useFrame((state) => {
    // Subtle, smooth camera parallax
    const targetX = state.pointer.x * 0.8;
    const targetY = state.pointer.y * 0.5 + 0.1;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.04);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.04);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Scene3D() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, Math.min(window.devicePixelRatio || 1, 2)]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          <CameraRig />

          {/* Ambient & Cinematic Accent Lights Framing the Edges */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.0} color="#ffffff" />
          <pointLight position={[-8, 4, 3]} intensity={3.0} color="#3b82f6" distance={20} />
          <pointLight position={[8, -4, 3]} intensity={3.0} color="#06b6d4" distance={20} />
          <pointLight position={[0, -6, 2]} intensity={2.5} color="#8b5cf6" distance={16} />

          {/* NOTE: Sphere/CoreGeometricNexus removed from center per user request */}
          {/* Ambient 3D Starfield & Floating Perimeter Particles */}
          <Starfield count={700} />
          <FloatingDebrisField count={14} />
        </Suspense>
      </Canvas>
    </div>
  );
}
