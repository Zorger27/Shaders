import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color } from 'three';

// ВНИМАНИЕ: Материалы импортируются из three/webgpu!
import { MeshBasicNodeMaterial } from 'three/webgpu';

// ВНИМАНИЕ: Вся математика и логика импортируется из three/tsl!
import { vec2, vec3, float, Fn, uv, uniform, Loop, If, Break, dot, max, sin, cos } from 'three/tsl';

// Импортируем SDF-функции из утилитного файла
import { sdfSphere, sdfTorus, smin } from "@/components/util/raymarchingMath.js";

// Карта сцены: возвращает минимальное расстояние до геометрии
const map = Fn(([p, morph]) => {
  // 1. Центр: Сфера радиусом 0.8
  const sphere = sdfSphere(p, float(0.8));

  // 2. Дополнительная форма: Тор (бублик) радиусом 0.5 и толщиной 0.2
  // Мы можем вращать p.zyx, чтобы изменить ориентацию тора
  const torus = sdfTorus(p.zyx, vec2(0.5, 0.2));

  // 3. Смешиваем их: k (0.3) — это "сила" слияния (чем больше, тем мягче переход)
  return smin(sphere, torus, morph.mul(0.5));
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

  // Логику генерации лучей и прохода по сцене (Raymarching Loop) мы напишем здесь
  sceneMaterial.colorNode = Fn(() => {
    // 1. Нормализуем координаты экрана (от -1 до 1)
    const st = uv().mul(2.0).sub(1.0);

    // --- ТЕСТ ПРОВЕРКИ ШЕЙДЕРА ---
    // Если хочешь проверить, работает ли TSL в принципе, раскомментируй строку ниже.
    // Она должна раскрасить квадрат в яркий градиент.
    // return vec3(st, 0.0);

    // 2. Настройки луча
    const ro = vec3(0.0, 0.0, -3.0);       // Ray Origin: камера отставлена назад по оси Z
    const rd = vec3(st, 1.0).normalize();  // Ray Direction: луч пускается сквозь пиксель экрана

    // 3. Изменяемые параметры для цикла реймершинга
    const t = float(0.0).toVar();          // Общая длина луча
    const hit = float(0.0).toVar();        // Флаг: столкнулись ли мы с объектом?

    // 4. САМ ЦИКЛ РЕЙМАРШИНГА (64 итерации)
    Loop(64, () => {
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
      If(t.greaterThan(10.0), () => {
        Break();
      });
    });

    // 5. Отрисовка результата
    // Если луч попал в сферу — красим в цвет объекта, если пролетел мимо — в темный фон
    const finalColor = vec3(0.05, 0.05, 0.08).toVar(); // Глубокий темный фон заднего плана

    // --- ПРИМЕНЯЕМ СВЕТ К ОБЪЕКТУ ---
    If(hit.equal(1.0), () => {
      // 1. Точная координата точки поверхности, в которую ударил луч
      const p = ro.add(rd.mul(t));

      // 2. Вычисляем нормаль в этой точке
      const n = calcNormal(p, uMorph);

      // 3. Создаем источник света (направлен сверху-справа)
      const lightDir = vec3(1.0, 1.0, -1.0).normalize();

      // 4. Освещение по Ламберту (Diffuse)
      // Скалярное произведение вектора света и нормали отсекает всё, что меньше 0.0
      const diff = max(dot(n, lightDir), 0.0);

      // 5. Базовое рассеянное освещение (Ambient), чтобы тень не была чёрной дырой
      const ambient = float(0.1);

      // 6. Итоговый множитель света
      const lighting = diff.add(ambient);

      // 7. Умножаем выбранный в UI цвет на свет
      finalColor.assign(uColor.mul(lighting));
    });

    return finalColor;
  })();

  return (
    <mesh ref={meshRef}>
      {/* Квадрат на весь экран перед камерой */}
      <planeGeometry args={[2, 2]} />
      <primitive object={sceneMaterial} attach="material" />
    </mesh>
  );
}
