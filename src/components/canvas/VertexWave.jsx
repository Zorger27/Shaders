import React, { useRef, useMemo, useEffect } from "react";
import { MeshPhysicalNodeMaterial } from 'three/webgpu';
import { positionLocal, time, sin, uniform, vec3, color } from 'three/tsl';
import * as THREE from 'three';

export const VertexWave = ({
                             amplitude = 1.0,
                             frequency = 1.0,
                             speed = 1.0,
                             wireframe = true
                           }) => {
  const meshRef = useRef(null);

  // 1. Оборачиваем наши параметры в uniforms для мгновенной передачи в GPU
  const uAmplitude = useMemo(() => uniform(amplitude), []);
  const uFrequency = useMemo(() => uniform(frequency), []);
  const uSpeed = useMemo(() => uniform(speed), []);

  // 2. Обновляем значения uniforms при изменении пропсов (движении слайдеров)
  useEffect(() => { uAmplitude.value = amplitude; }, [amplitude, uAmplitude]);
  useEffect(() => { uFrequency.value = frequency; }, [frequency, uFrequency]);
  useEffect(() => { uSpeed.value = speed; }, [speed, uSpeed]);

  const materialNode = useMemo(() => {
    const mat = new MeshPhysicalNodeMaterial();

    // Включаем двусторонний рендеринг, чтобы волну было видно снизу
    mat.side = THREE.DoubleSide;

    // Красивый базовый цвет для нашей сетки
    mat.colorNode = color(new THREE.Color('#00ffcc'));
    mat.metalness = 0.5;
    mat.roughness = 0.2;

    // --- МАГИЯ VERTEX SHADER ---

    // Формула: Z = sin((X * frequency) + (time * speed)) * amplitude
    // Мы берем локальную позицию X каждой вершины, умножаем на частоту,
    // прибавляем время (чтобы волна бежала) и умножаем на амплитуду (высота волны).
    const waveZ = sin(positionLocal.x.mul(uFrequency).add(time.mul(uSpeed))).mul(uAmplitude);

    // Поскольку PlaneGeometry по умолчанию лежит в плоскости XY,
    // мы смещаем вершины по оси Z (к камере / от камеры).
    // Итоговая позиция = старая позиция + вектор смещения(0, 0, waveZ)
    mat.positionNode = positionLocal.add(vec3(0.0, 0.0, waveZ));

    return mat;
  }, []);

  // Динамическое переключение сетки
  useEffect(() => {
    if (materialNode) {
      materialNode.wireframe = wireframe;
      materialNode.needsUpdate = true;
    }
  }, [wireframe, materialNode]);

  return (
    // Вращаем плоскость, чтобы она лежала как "пол", а волны шли вверх-вниз
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      {/* 10, 10 - размер плоскости
        128, 128 - количество сегментов (вершин).
        Чем их больше, тем плавнее изгибается волна!
      */}
      <planeGeometry args={[10, 10, 128, 128]} />
      <primitive object={materialNode} attach="material" />
    </mesh>
  );
};