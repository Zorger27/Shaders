import React, { useRef, useMemo, useEffect } from "react";
import { MeshPhysicalNodeMaterial } from 'three/webgpu';
import { positionLocal, time, sin, uniform, vec3, color, length, vec2 } from 'three/tsl';
import * as THREE from 'three';

export const VertexWave = ({
                             amplitude = 0.5,
                             frequency = 1.0,
                             speed = 1.0,
                             wireframe = true
                           }) => {
  const meshRef = useRef(null);

  const uAmplitude = useMemo(() => uniform(amplitude), []);
  const uFrequency = useMemo(() => uniform(frequency), []);
  const uSpeed = useMemo(() => uniform(speed), []);

  useEffect(() => { uAmplitude.value = amplitude; }, [amplitude]);
  useEffect(() => { uFrequency.value = frequency; }, [frequency]);
  useEffect(() => { uSpeed.value = speed; }, [speed]);

  const materialNode = useMemo(() => {
    const mat = new MeshPhysicalNodeMaterial();
    mat.side = THREE.DoubleSide;

    // Красивый насыщенный голубой цвет
    mat.colorNode = color(new THREE.Color('#00aaff'));
    mat.roughness = 0.15;
    mat.metalness = 0.6;

    // --- ЛОГИКА VERTEX SHADER ---

    // 1. Вычисляем расстояние от центра (0,0) до текущей вершины по осям X и Y
    const dist = length(vec2(positionLocal.x, positionLocal.y));

    // 2. Берем время, умноженное на скорость
    const t = time.mul(uSpeed);

    // 3. Формула радиальной волны: sin((дистанция * частота) - время) * амплитуда
    // Вычитание времени (sub) заставляет волну расходиться от центра к краям!
    const displacement = sin(dist.mul(uFrequency).sub(t)).mul(uAmplitude);

    // Применяем смещение по оси Z
    mat.positionNode = positionLocal.add(vec3(0, 2, displacement));

    return mat;
  }, []);

  useEffect(() => {
    if (materialNode) materialNode.wireframe = wireframe;
  }, [wireframe, materialNode]);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Оставляем плотную сетку для плавности кругов */}
      <planeGeometry args={[10, 10, 128, 128]} />
      <primitive object={materialNode} attach="material" />
    </mesh>
  );
};