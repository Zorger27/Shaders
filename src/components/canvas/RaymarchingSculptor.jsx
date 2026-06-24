import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, BackSide } from 'three';

// ВНИМАНИЕ: Материалы импортируются из three/webgpu!
import { MeshBasicNodeMaterial } from 'three/webgpu';

// ВНИМАНИЕ: Вся математика и логика импортируется из three/tsl!
// ВАЖНО: Добавили Discard для прозрачности и mix для истинного морфинга
import { vec2, vec3, vec4, float, Fn, uniform, Loop, If, Break, dot, max, clamp, mix, cameraPosition, positionWorld, Discard } from 'three/tsl';

// Импортируем SDF-функции из утилитного файла
import { sdfSphere, sdfTorus, sdfBox } from "@/components/util/raymarchingMath.js";

// Карта сцены: возвращает минимальное расстояние до геометрии
const map = Fn(([p, morph]) => {
  // Базовые фигуры
  const sphere = sdfSphere(p, float(1.8));

  // ИСПОЛЬЗУЕМ p.xzy — это поворачивает тор так, чтобы дырка смотрела в камеру (вдоль оси Z)
  const torus = sdfTorus(p.xzy, vec2(1.7, 0.6));
  const box = sdfBox(p, vec3(1.4));

  // --- ИСТИННЫЙ МОРФИНГ (ЧЕРЕЗ MIX) ---
  // factor1: меняется от 0 до 1, пока morph идет от 0.0 до 0.5
  const factor1 = clamp(morph.mul(2.0), 0.0, 1.0);

  // Перетекание из Сферы в Тор
  const stage1 = mix(sphere, torus, factor1);

  // factor2: меняется от 0 до 1, пока morph идет от 0.5 до 1.0
  const factor2 = clamp(morph.sub(0.5).mul(2.0), 0.0, 1.0);

  // Перетекание из получившегося результата (Тора) в Куб
  return mix(stage1, box, factor2);
});

// --- ВЫЧИСЛЕНИЕ НОРМАЛЕЙ (Градиент SDF) ---
const calcNormal = Fn(([p, morph]) => {
  const e = vec2(0.001, 0.0);
  return vec3(
    // Теперь передаем morph во все вызовы map
    map(p.add(e.xyy), morph).sub(map(p.sub(e.xyy), morph)),
    map(p.add(e.yxy), morph).sub(map(p.sub(e.yxy), morph)),
    map(p.add(e.yyx), morph).sub(map(p.sub(e.yyx), morph))
  ).normalize();
});

export default function RaymarchingSculptor({ morphFactor, objectColor }) {
  const meshRef = useRef(null);

  // Привязываем реактивный цвет из React к TSL uniform-переменной
  const uColor = uniform(new Color(objectColor));
  const uMorph = uniform(morphFactor);

  useFrame(() => {
    // Синхронизация параметров на каждом кадре
    uColor.value.set(objectColor);
    uMorph.value = morphFactor;
  });

  // --- ГЛАВНЫЙ ЦИКЛ РЕЙМАРШИНГА В TSL ---
  const sceneMaterial = new MeshBasicNodeMaterial();

  // Обязательно включаем поддержку прозрачности на уровне материала
  sceneMaterial.transparent = true;

  // Логику генерации лучей и прохода по сцене (Raymarching Loop) мы напишем здесь
  sceneMaterial.colorNode = Fn(() => {

    // --- ИСТИННАЯ СВЯЗЬ С КАМЕРОЙ THREE.JS ---
    // Точка старта луча — это реальная позиция камеры
    const ro = cameraPosition;
    // Направление луча — это вектор от камеры к внутренней стенке нашего огромного куба-холста
    const rd = positionWorld.sub(cameraPosition).normalize();

    // Изменяемые параметры для цикла реймершинга
    const t = float(0.0).toVar();          // Общая длина луча
    const hit = float(0.0).toVar();        // Флаг: столкнулись ли мы с объектом?

    // САМ ЦИКЛ РЕЙМАРШИНГА (128 итераций)
    Loop(128, () => {
      // Текущая точка луча в пространстве: p = ro + rd * t
      const p = ro.add(rd.mul(t));

      // Запрашиваем расстояние до ближайшей точки сферы
      const d = map(p, uMorph);

      // Шагаем вперед на это расстояние
      t.addAssign(d);

      // Условие столкновения: если подошли ближе чем на 0.001
      If(d.lessThan(0.001), () => {
        hit.assign(1.0); // Фиксируем попадание
        Break();         // Прерываем цикл, дальше шагать не нужно
      });

      // Ограничение видимости: если улетели слишком далеко
      If(t.greaterThan(30.0), () => {
        Break();
      });
    });

    // 1. ИЗНАЧАЛЬНО весь наш "холст" полностью прозрачный (Альфа = 0.0)
    const finalColor = vec4(0.0, 0.0, 0.0, 0.0).toVar();

    // 2. Вычисляем цвет ТОЛЬКО если луч врезался в фигуру
    If(hit.equal(1.0), () => {

      // 1. Точная координата точки поверхности, в которую ударил луч
      const p = ro.add(rd.mul(t));
      // 2. Вычисляем нормаль в этой точке
      const n = calcNormal(p, uMorph);
      // 3. Создаем источник света (направлен сверху-справа)
      const lightDir = vec3(1.0, 1.0, 1.0).normalize();
      // 4. Освещение по Ламберту (Diffuse) - Скалярное произведение вектора света и нормали отсекает всё, что меньше 0.0
      const diff = max(dot(n, lightDir), 0.0);
      // 5. Базовое рассеянное освещение (Ambient), чтобы тень не была чёрной дырой
      const ambient = float(0.15);
      // 6. Итоговый множитель света
      const lighting = diff.add(ambient);

      // Закрашиваем фигуру цветом и делаем её плотной (Альфа = 1.0)
      finalColor.assign(vec4(uColor.mul(lighting), 1.0));

    }).Else(() => {
      // 3. Для всех лучей, которые пролетели мимо фигур — жестко уничтожаем пиксель
      Discard();
    });

    // 4. Возвращаем результат
    return finalColor;



  })();

  return (
    <mesh ref={meshRef}>
      {/* ОГРОМНЫЙ КУБ.
        Мы помещаем камеру ВНУТРЬ этого куба (side={BackSide}).
        Это наша "комната", на внутренних стенах которой рендерится реймаршинг!
      */}
      <boxGeometry args={[50, 50, 50]} />
      <primitive object={sceneMaterial} attach="material" side={BackSide} />
    </mesh>
  );
}
