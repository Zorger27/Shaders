import React from 'react';
import { Canvas } from '@react-three/fiber';
import { WebGPURenderer } from 'three/webgpu';
import * as THREE from 'three';

// Компонент рендера
const WebGPUCanvas = ({ children, style, ...props }) => {
  return (
    <Canvas
      style={style}
      gl={async ({ canvas }) => {
        const renderer = new WebGPURenderer({
          canvas,
          antialias: true,
          alpha: true,
        });

        await renderer.init();

        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.NoToneMapping;
        // console.log('WebGPU INIT:', renderer); // Убеждаемся, что реально используется WebGPU

        return renderer;
      }}
      {...props}
    >
      {children}
    </Canvas>
  );
};

export default WebGPUCanvas;