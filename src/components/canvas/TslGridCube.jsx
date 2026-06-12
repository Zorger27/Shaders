import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshPhysicalNodeMaterial } from 'three/webgpu';
import { instanceIndex, positionLocal, float, vec3, mod, floor } from 'three/tsl';

export const TslGridCube = ({ gridSize }) => {
  const count = gridSize * gridSize * gridSize;
  const meshRef = useRef(null);

  // Константы базового (идеального) состояния
  const baseGridSize = 10;
  const baseSpacing = 0.30;
  const baseBoxSize = 0.16;

  // Динамический пересчет пропорций для сохранения общего объема модели
  const scaleRatio = baseGridSize / gridSize;
  const currentSpacing = baseSpacing * scaleRatio;
  const currentBoxSize = baseBoxSize * scaleRatio;

  const materialNode = useMemo(() => {
    const mat = new MeshPhysicalNodeMaterial();
    const sizeF = float(gridSize);
    const indexF = float(instanceIndex);

    // Расчет координат сетки на GPU
    const x = mod(indexF, sizeF);
    const y = mod(floor(indexF.div(sizeF)), sizeF);
    const z = floor(indexF.div(sizeF.mul(sizeF)));

    // Центрирование
    const centerOffset = sizeF.mul(0.5).sub(0.5);
    const spacingNode = float(currentSpacing);

    const instanceOffset = vec3(
      x.sub(centerOffset),
      y.sub(centerOffset),
      z.sub(centerOffset)
    ).mul(spacingNode);

    mat.positionNode = positionLocal.add(instanceOffset);

    // Градиент цвета по осям
    const r = x.div(sizeF);
    const g = y.div(sizeF);
    const b = z.div(sizeF);
    mat.colorNode = vec3(r, g, b);

    // mat.colorNode = vec3(0.66, 0.36, 1.0);

    // Физические свойства материала
    mat.roughness = 0.1;
    mat.metalness = 0.9;

    return mat;
  }, [gridSize, currentSpacing]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} scale={1}>
      <boxGeometry args={[currentBoxSize, currentBoxSize, currentBoxSize]} />
      <primitive object={materialNode} attach="material" />
    </instancedMesh>
  );
};