import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, BackSide } from 'three';

// ВНИМАНИЕ: Материалы импортируются из three/webgpu!
import { MeshBasicNodeMaterial } from 'three/webgpu';

// ВНИМАНИЕ: Вся математика и логика импортируется из three/tsl!
// ВАЖНО: Добавили Discard для прозрачности и mix для истинного морфинга
import { vec2, vec3, vec4, float, Fn, uniform, Loop, If, Break, dot, max, clamp, mix, cameraPosition, positionWorld, Discard } from 'three/tsl';

// Импортируем SDF-функции из утилитного файла
import { sdfSphere, sdfTorus, sdfCylinder, sdfCone, fractalDisplacement } from "@/components/util/raymarchingMath.js";

// Карта сцены: возвращает минимальное расстояние до геометрии
const map = Fn(([p, morph, chaos]) => {
// 1. Создаем базовые фигуры с выверенными пропорциями
  const sphere = sdfSphere(p, float(2.0));
  const torus = sdfTorus(p.xzy, vec2(1.7, 0.6));
  const cylinder = sdfCylinder(p, vec2(1.8, 1.4));  // Радиус 1.8, Половина высоты 1.4
  const cone = sdfCone(p, float(2.2), float(1.5));  // Радиус низа 2.2, Половина высоты 1.5

  // --- ИСТИННЫЙ МОРФИНГ (ЧЕРЕЗ MIX) ---
  // Этап 1 (0.0 - 1.0): Сфера -> Тор
  const factor1 = clamp(morph, 0.0, 1.0);
  const stage1 = mix(sphere, torus, factor1);

  // Этап 2 (1.0 - 2.0): Тор -> Цилиндр
  const factor2 = clamp(morph.sub(1.0), 0.0, 1.0);
  const stage2 = mix(stage1, cylinder, factor2);

  // Этап 3 (2.0 - 3.0): Цилиндр -> Конус
  const factor3 = clamp(morph.sub(2.0), 0.0, 1.0);
  const baseShape = mix(stage2, cone, factor3);

  // ВЫЧИСЛЯЕМ ФРАКТАЛЬНОЕ ИСКАЖЕНИЕ И ПРИБАВЛЯЕМ К БАЗОВОЙ ФОРМЕ
  const displacement = fractalDisplacement(p, chaos);

  return baseShape.sub(displacement);
});

// --- ВЫЧИСЛЕНИЕ НОРМАЛЕЙ (Градиент SDF) ---
const calcNormal = Fn(([p, morph, chaos]) => {
  const e = vec2(0.001, 0.0);
  return vec3(
    // Теперь передаем morph во все вызовы map
    map(p.add(e.xyy), morph, chaos).sub(map(p.sub(e.xyy), morph, chaos)),
    map(p.add(e.yxy), morph, chaos).sub(map(p.sub(e.yxy), morph, chaos)),
    map(p.add(e.yyx), morph, chaos).sub(map(p.sub(e.yyx), morph, chaos))
  ).normalize();
});

export default function RaymarchingSculptor({ morphFactor, colorSphere, colorTorus, colorCylinder, colorCone, fractalChaos }) {
  const meshRef = useRef(null);

  // Привязываем реактивный цвет из React к TSL uniform-переменной
  const uColorSphere = uniform(new Color(colorSphere));
  const uColorTorus = uniform(new Color(colorTorus));
  const uColorCylinder = uniform(new Color(colorCylinder));
  const uColorCone = uniform(new Color(colorCone));
  const uMorph = uniform(morphFactor);
  const uChaos = uniform(fractalChaos);

  useFrame(() => {
    // Синхронизация параметров на каждом кадре
    uColorSphere.value.set(colorSphere);
    uColorTorus.value.set(colorTorus);
    uColorCylinder.value.set(colorCylinder);
    uColorCone.value.set(colorCone);
    uMorph.value = morphFactor;
    uChaos.value = fractalChaos; // <-- Обновляем каждый кадр
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
      const d = map(p, uMorph, uChaos);

      // Шагаем вперед на это расстояние. Умножаем шаг на 0.5!
      // Поскольку фрактал искажает дистанцию, луч может "перешагнуть" стенку.
      // Шагая в 2 раза короче, мы делаем рендеринг точным (без артефактов и дыр).
      t.addAssign(d.mul(0.5));

      // Условие столкновения: если подошли ближе чем на 0.001
      If(d.lessThan(0.002), () => {
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
      // 2. Вычисляем нормаль в этой точке. Передаем uChaos в calcNormal для правильных теней на шипах!
      const n = calcNormal(p, uMorph, uChaos);
      // 3. Создаем источник света (направлен сверху-справа)
      const lightDir = vec3(1.0, 1.0, 1.0).normalize();
      // 4. Освещение по Ламберту (Diffuse) - Скалярное произведение вектора света и нормали отсекает всё, что меньше 0.0
      const diff = max(dot(n, lightDir), 0.0);
      // 5. Базовое рассеянное освещение (Ambient), чтобы тень не была чёрной дырой
      const ambient = float(0.15);
      // 6. Итоговый множитель света
      const lighting = diff.add(ambient);

      // --- ДИНАМИЧЕСКОЕ СМЕШИВАНИЕ ЦВЕТОВ ---
      // Повторяем ту же логику, что и при смешивании геометрии

      // В этом блоке мы рассчитываем цвет ровно один раз для каждого пикселя на экране, только если луч уже врезался в поверхность.
      // Это делает шейдер невероятно быстрым!

      // Этап 1 (0.0 - 1.0): Сфера -> Тор
      const c1 = clamp(uMorph, 0.0, 1.0);
      const colorStage1 = mix(uColorSphere, uColorTorus, c1);

      // Этап 2 (1.0 - 2.0): Тор -> Цилиндр
      const c2 = clamp(uMorph.sub(1.0), 0.0, 1.0);
      const colorStage2 = mix(colorStage1, uColorCylinder, c2);

      // Этап 3 (2.0 - 3.0): Цилиндр -> Конус
      const c3 = clamp(uMorph.sub(2.0), 0.0, 1.0);
      const finalObjectColor = mix(colorStage2, uColorCone, c3);

      // Красим пиксель итоговым смешанным цветом и умножаем на освещение
      finalColor.assign(vec4(finalObjectColor.mul(lighting), 1.0));

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
