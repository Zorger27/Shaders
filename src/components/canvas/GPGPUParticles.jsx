import React, { useMemo } from 'react';
import { extend } from '@react-three/fiber';
import { MeshBasicNodeMaterial, StorageInstancedBufferAttribute } from 'three/webgpu';
import { storage, positionLocal, color, instanceIndex } from 'three/tsl';
import { generateSphericalGrid } from "@/components/util/geometry.js";

// Регистрируем материал, чтобы R3F понимал тег <meshBasicNodeMaterial />
extend({ MeshBasicNodeMaterial });

export default function GPGPUParticles() {
  // 1. Генерируем стартовую сетку

  // Генерируем массив (например, сетка 64x64x64, радиус 5) - из-за обрезки углов куба останется около 140 000 частиц — идеально для GPU!
  const basePositions = useMemo(() => generateSphericalGrid(64, 3.0), []);

  // Узнаем точное количество получившихся частиц (массив плоский [x, y, z], поэтому делим на 3)
  const particleCount = basePositions.length / 3;

  // 2. Создаем правильный Storage-буфер для WebGPU
  //    StorageInstancedBufferAttribute позволяет видеокарте не только читать,
  //    но и перезаписывать эти данные в будущих вычислениях (Compute Shaders)
    const particlesAttribute = useMemo(() =>
      new StorageInstancedBufferAttribute(basePositions, 3),
    [basePositions]);

  // 3. Создаем TSL-логику для материала
  const materialLogic = useMemo(() => {
    // Создаем TSL-ноду хранилища из нашего атрибута
    const positionStorage = storage(particlesAttribute, 'vec3', particleCount);

    // Достаем позицию конкретной частицы по её индексу (instanceIndex)
    // и прибавляем к локальным вершинам геометрии кубика
    const finalPosition = positionLocal.add(positionStorage.element(instanceIndex));

    return {
      positionNode: finalPosition,
      colorNode: color('#248370')
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