import React, { useMemo, useEffect } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import { MeshBasicNodeMaterial, StorageInstancedBufferAttribute } from 'three/webgpu';
import { storage, positionLocal, instanceIndex, Fn, length, uniform, select, vec3 } from 'three/tsl';
import { generateSphericalGrid } from "@/components/util/geometry.js";
import * as THREE from 'three';

// Регистрируем материал, чтобы R3F понимал тег <meshBasicNodeMaterial />
extend({ MeshBasicNodeMaterial });

export default function GPGPUParticles({
                                         isExploding = false,
                                         gravityForce = 0.002,
                                         friction = 0.98,
                                         explosionPower = 1.5,
                                         particleColor = '#7300ff'
                                       }) {

  // --- ЮНИФОРМЫ ---
  const uGravity = useMemo(() => uniform(gravityForce), []);
  const uFriction = useMemo(() => uniform(friction), []);
  const uExplode = useMemo(() => uniform(isExploding ? 1.0 : 0.0), []);
  const uExplosionPower = useMemo(() => uniform(explosionPower), []);
  const uColor = useMemo(() => uniform(new THREE.Color(particleColor)), []);

  // Синхронизируем React props с TSL юниформами (эффективное обновление без ререндера шейдера)
  useEffect(() => { uGravity.value = gravityForce; }, [gravityForce]);
  useEffect(() => { uFriction.value = friction; }, [friction]);
  useEffect(() => { uExplode.value = isExploding ? 1.0 : 0.0; }, [isExploding]);
  useEffect(() => { uExplosionPower.value = explosionPower; }, [explosionPower]);
  useEffect(() => { uColor.value.set(particleColor); }, [particleColor]);

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
  const velocityAttribute = useMemo(() =>
      new StorageInstancedBufferAttribute(new Float32Array(particleCount * 3), 3),
    [particleCount]);

  const initVelocityAttribute = useMemo(() => {
    const initVelocities = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const x = basePositions[i * 3];
      const y = basePositions[i * 3 + 1];
      const z = basePositions[i * 3 + 2];
      const len = Math.sqrt(x*x + y*y + z*z) || 1;

      initVelocities[i * 3]     = (x / len);
      initVelocities[i * 3 + 1] = (y / len);
      initVelocities[i * 3 + 2] = (z / len);
    }
    return new StorageInstancedBufferAttribute(initVelocities, 3);
  }, [basePositions, particleCount]);

  // Вычислительный Шейдер (Compute Shader)
  const computeNode = useMemo(() => {
    // Fn компилируется в WGSL-код, который выполняется прямо на видеокарте
    const computePhysics = Fn(() => {
      // Достаем позицию и скорость ТЕКУЩЕЙ частицы
      const pos = storage(particlesAttribute, 'vec3', particleCount).element(instanceIndex);
      const vel = storage(velocityAttribute, 'vec3', particleCount).element(instanceIndex);
      const initVel = storage(initVelocityAttribute, 'vec3', particleCount).element(instanceIndex);

      // Проверяем состояние галочки через select() прямо внутри видеокарты
      vel.addAssign(
        select(
          uExplode.greaterThan(0.5),

          // РЕЖИМ АКТИВНОГО ВЗРЫВА (Галочка стоит): Гравитация + Отскок от центра
          pos.mul(-1.0).normalize().mul(length(pos).mul(uGravity)).add(
            select(
              length(pos).lessThan(0.05),
              initVel.mul(uExplosionPower).mul(0.15),
              vec3(0.0)
            )
          ),

          // РЕЖИМ ПОКОЯ (Галочка снята): Плавный возврат частиц на исходный радиус 5.0
          initVel.mul(5.0).sub(pos).mul(0.05)
        )
      );

      // 3. Трение и применение скорости к позиции
      vel.mulAssign(uFriction);
      pos.addAssign(vel);
    });

    // Создаем ноду вычислений на нужное количество инстансов
    return computePhysics().compute(particleCount);
  }, [particlesAttribute, velocityAttribute, initVelocityAttribute, particleCount, uGravity, uFriction, uExplode, uExplosionPower]);

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
      colorNode: uColor
    };
  }, [particlesAttribute, particleCount, uColor]);

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