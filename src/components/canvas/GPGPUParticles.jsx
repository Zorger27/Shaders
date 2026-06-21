import React, { useMemo } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import { MeshBasicNodeMaterial, StorageInstancedBufferAttribute } from 'three/webgpu';
import { storage, positionLocal, color, instanceIndex, Fn, length } from 'three/tsl';
import { generateSphericalGrid } from "@/components/util/geometry.js";

// Регистрируем материал, чтобы R3F понимал тег <meshBasicNodeMaterial />
extend({ MeshBasicNodeMaterial });

export default function GPGPUParticles() {
  // I. Генерируем стартовую сетку

  // Генерируем массив (например, сетка 64x64x64, радиус 5) - из-за обрезки углов куба останется около 140 000 частиц — идеально для GPU!
  const basePositions = useMemo(() => generateSphericalGrid(64, 5.0), []);

  // Узнаем точное количество получившихся частиц (массив плоский [x, y, z], поэтому делим на 3)
  const particleCount = basePositions.length / 3;

  // II. Создаем правильный Storage-буфер для WebGPU
  //    StorageInstancedBufferAttribute позволяет видеокарте не только читать,
  //    но и перезаписывать эти данные в будущих вычислениях (Compute Shaders)
    const particlesAttribute = useMemo(() =>
      new StorageInstancedBufferAttribute(basePositions, 3),
    [basePositions]);

  // Буфер Скоростей (Velocity)
  // Инициализируем "взрыв": задаем начальную скорость от центра
  const velocityAttribute = useMemo(() => {
    const velocities = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const x = basePositions[i * 3];
      const y = basePositions[i * 3 + 1];
      const z = basePositions[i * 3 + 2];

      // Вычисляем вектор от центра и нормализуем его
      const len = Math.sqrt(x*x + y*y + z*z) || 1;
      const explosionForce = Math.random() * 0.15; // Рандомная сила разлета

      velocities[i * 3]     = (x / len) * explosionForce;
      velocities[i * 3 + 1] = (y / len) * explosionForce;
      velocities[i * 3 + 2] = (z / len) * explosionForce;
    }
    return new StorageInstancedBufferAttribute(velocities, 3);
  }, [basePositions, particleCount]);

  // Вычислительный Шейдер (Compute Shader)
  const computeNode = useMemo(() => {
    // Fn компилируется в WGSL-код, который выполняется прямо на видеокарте
    const computePhysics = Fn(() => {
      // Достаем позицию и скорость ТЕКУЩЕЙ частицы
      const pos = storage(particlesAttribute, 'vec3', particleCount).element(instanceIndex);
      const vel = storage(velocityAttribute, 'vec3', particleCount).element(instanceIndex);

      // --- ГРАВИТАЦИЯ ---
      // Вектор направления к центру (просто инвертируем позицию)
      const dirToCenter = pos.mul(-1.0).normalize();
      const dist = length(pos); // Расстояние от центра

      // Пружинная гравитация: чем дальше частица, тем сильнее её тянет обратно
      const gravityForce = dist.mul(0.002);

      // Прибавляем гравитацию к скорости (vel += dir * force)
      vel.addAssign(dirToCenter.mul(gravityForce));

      // --- ТРЕНИЕ ---
      // Чтобы частицы не летали бесконечно, гасим их скорость (затухание)
      vel.mulAssign(0.98);

      // --- ОБНОВЛЕНИЕ ПОЗИЦИИ ---
      // Сдвигаем частицу на величину её скорости (pos += vel)
      pos.addAssign(vel);
    });

    // Создаем ноду вычислений на нужное количество инстансов
    return computePhysics().compute(particleCount);
  }, [particlesAttribute, velocityAttribute, particleCount]);

  // Выполняем Compute Shader каждый кадр (60 FPS)
  useFrame((state) => {
    // state.gl - это наш WebGPURenderer. Говорим ему: "Посчитай физику!"
    state.gl.compute(computeNode);
  });

  // III. Создаем TSL-логику для материала
  const materialLogic = useMemo(() => {
    // Создаем TSL-ноду хранилища из нашего атрибута
    const positionStorage = storage(particlesAttribute, 'vec3', particleCount);

    // Достаем позицию конкретной частицы по её индексу (instanceIndex) и прибавляем к локальным вершинам геометрии кубика
    const finalPosition = positionLocal.add(positionStorage.element(instanceIndex))

    return {
      positionNode: finalPosition,
      colorNode: color('#7a43d8')
    };
  }, [particlesAttribute, particleCount]);

  return (
    <instancedMesh args={[null, null, particleCount]}>
      {/* Крошечный кубик как физическая частица */}
      <boxGeometry args={[0.04, 0.04, 0.04]} />

      {/* Node-материал, который "понимает" TSL */}
      <meshBasicNodeMaterial
        positionNode={materialLogic.positionNode}
        colorNode={materialLogic.colorNode}
        toneMapped={false} /* Отключаем tone mapping, чтобы цвет ярко "светился" */
      />

    </instancedMesh>
  );
}