import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Color } from "three";
import { MeshPhysicalNodeMaterial } from 'three/webgpu';
import { instanceIndex, positionLocal, float, vec3, mod, floor, uniform, max, clamp } from 'three/tsl';

// Максимальный размер сетки. 25x25x25 = 15625 кубиков.
const MAX_GRID = 25;
const TOTAL_INSTANCES = MAX_GRID * MAX_GRID * MAX_GRID;

export const TslGridCube = ({ gridSize, colorX, colorY, colorZ, rotateObject }) => {
  const meshRef = useRef(null);

  // Создаем uniforms, которые будут плавно обновляться каждый кадр
  const uGridSize = useMemo(() => uniform(float(gridSize)), []);
  const uColorX = useMemo(() => uniform(new Color(colorX)), []);
  const uColorY = useMemo(() => uniform(new Color(colorY)), []);
  const uColorZ = useMemo(() => uniform(new Color(colorZ)), []);

  useFrame((state, delta) => {
    // Обновляем униформы
    uGridSize.value = gridSize;
    uColorX.value.set(colorX);
    uColorY.value.set(colorY);
    uColorZ.value.set(colorZ);

    // Вращение объекта
    if (meshRef.current && rotateObject) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  const materialNode = useMemo(() => {
    const mat = new MeshPhysicalNodeMaterial();

    const maxGridF = float(MAX_GRID);
    const indexF = float(instanceIndex);

    // 1. ВЫЧИСЛЕНИЕ ФИКСИРОВАННЫХ КООРДИНАТ (0 до 24 по каждой оси)
    const x = mod(indexF, maxGridF);
    const y = mod(floor(indexF.div(maxGridF)), maxGridF);
    const z = floor(indexF.div(maxGridF.mul(maxGridF)));

    // 2. ЛОГИКА ПЛАВНОГО ПОЯВЛЕНИЯ (Магия)
    // Находим максимальную координату куба. Если она меньше текущего uGridSize — куб виден.
    const maxCoord = max(x, max(y, z));
    // clamp создает плавный градиент от 0 до 1 для пограничных кубиков
    const cubeVisibilityScale = clamp(uGridSize.sub(maxCoord), 0.0, 1.0);

    // 3. ДИНАМИЧЕСКИЙ ПЕРЕСЧЕТ РАЗМЕРОВ И ОТСТУПОВ (Сохраняем общий объем 10x10)
    // Защита от деления на ноль: берем максимум между uGridSize и 0.001
    const safeGridSize = max(uGridSize, float(0.001));
    const scaleRatio = float(10.0).div(safeGridSize);

    const currentBoxSize = float(0.16).mul(scaleRatio);
    const currentSpacing = float(0.30).mul(scaleRatio);

    // Умножаем базовый размер на visibility, чтобы лишние кубы стали нулевого размера (исчезли)
    const finalVertexScale = currentBoxSize.mul(cubeVisibilityScale);

    // 4. ЦЕНТРИРОВАНИЕ ФИГУРЫ
    const centerOffset = uGridSize.sub(1.0).mul(0.5);
    const instanceOffset = vec3(
      x.sub(centerOffset),
      y.sub(centerOffset),
      z.sub(centerOffset)
    ).mul(currentSpacing);

    // Масштабируем саму геометрию куба и двигаем на позицию
    mat.positionNode = positionLocal.mul(finalVertexScale).add(instanceOffset);

    // 5. ДИНАМИЧЕСКИЕ ЦВЕТА
    // Нормализуем координаты от 0 до 1 на основе ТЕКУЩЕГО размера сетки
    const divisor = max(uGridSize.sub(1.0), float(1.0));
    const r = x.div(divisor);
    const g = y.div(divisor);
    const b = z.div(divisor);

    // Смешиваем выбранные пользователем цвета по осям (Additive Blending)
    const cX = uColorX.mul(r);
    const cY = uColorY.mul(g);
    const cZ = uColorZ.mul(b);
    mat.colorNode = cX.add(cY).add(cZ);

    mat.roughness = 0.1;
    mat.metalness = 0.9;

    return mat;
  }, []);

  return (
    // Count всегда фиксирован на максимум (15625). GPU с этим справляется играючи.
    <instancedMesh ref={meshRef} args={[null, null, TOTAL_INSTANCES]} scale={1}>
      {/* Базовый размер 1x1x1, остальное масштабирует TSL (positionLocal.mul(finalVertexScale)) */}
      <boxGeometry args={[1, 1, 1]} />
      <primitive object={materialNode} attach="material" />
    </instancedMesh>
  );
};