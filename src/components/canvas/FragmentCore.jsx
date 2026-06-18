import React, { useRef, useMemo, useEffect } from "react";
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { Fn, uv, time, uniform, vec2, vec3, color, mix, cos, sin, length, add, mul } from 'three/tsl';
import * as THREE from 'three';

export const FragmentCore = ({
                               viscosity = 1.0,
                               turbulence = 1.5,
                               speed = 1.0
                             }) => {
  const meshRef = useRef(null);

  // Uniforms для мгновенной передачи параметров с UI
  const uViscosity = useMemo(() => uniform(viscosity), []);
  const uTurbulence = useMemo(() => uniform(turbulence), []);
  const uSpeed = useMemo(() => uniform(speed), []);

  useEffect(() => { uViscosity.value = viscosity; }, [viscosity]);
  useEffect(() => { uTurbulence.value = turbulence; }, [turbulence]);
  useEffect(() => { uSpeed.value = speed; }, [speed]);

  const materialNode = useMemo(() => {
    const mat = new MeshBasicNodeMaterial();
    mat.side = THREE.DoubleSide;

    // --- ФРАГМЕНТНЫЙ ШЕЙДЕР (TSL) ---

    // 1. Центрируем UV-координаты (от -0.5 до 0.5)
    // Это нужно, чтобы эффект расходился из центра экрана
    const centeredUv = uv().sub(vec2(0.5));

    // Вычисляем расстояние от центра (для виньетки/затухания по краям)
    const distToCenter = length(centeredUv);

    // Умножаем UV на параметр вязкости (масштаб)
    const p = centeredUv.mul(uViscosity).mul(5.0);

    // Модифицированное время
    const t = time.mul(uSpeed).mul(0.5);

    // 2. Вспомогательная функция псевдо-шума (на базе синусов)
    // В TSL можно описывать свои функции через Fn
    const fluidNoise = Fn(([pos]) => {
      const pVar = pos.toVar();
      // Сложное переплетение синусов по осям X и Y
      const n1 = sin(pVar.x.add(pVar.y).add(t));
      const n2 = cos(pVar.x.mul(1.5).sub(pVar.y.mul(1.5)).sub(t));
      return n1.add(n2).mul(0.5); // возвращает от -1 до 1
    });

    // 3. Domain Warping (Искажение пространства)
    // Шаг А: Первое искажение
    const q1 = vec2(
      fluidNoise(p),
      fluidNoise(p.add(vec2(5.2, 1.3)))
    );

    // Шаг Б: Второе искажение (искажаем уже искаженные координаты!)
    // Умножаем на turbulence, чтобы управлять силой завихрений
    const pDistorted = p.add(q1.mul(uTurbulence));
    const q2 = vec2(
      fluidNoise(pDistorted.add(vec2(1.7, 9.2)).add(t)),
      fluidNoise(pDistorted.add(vec2(8.3, 2.8)).sub(t))
    );

    // Шаг В: Финальное значение шума
    const finalNoise = fluidNoise(p.add(q2).add(t));

    // 4. Генерация цвета (Косинусные палитры Иньиго Килеса)
    // Формула: color(t) = a + b * cos( 2*PI * (c*t + d) )
    const colorA = vec3(0.5, 0.5, 0.5);
    const colorB = vec3(0.5, 0.5, 0.5);
    const colorC = vec3(1.0, 1.0, 1.0);
    // Настройки для яркой кибер-плазмы (бирюзовый -> синий -> фиолетовый)
    const colorD = vec3(0.0, 0.33, 0.67);

    // Нормализуем шум от 0 до 1 для палитры
    const noiseNorm = finalNoise.add(1.0).mul(0.5);

    // Собираем цвет
    const palettePhase = colorC.mul(noiseNorm).add(colorD).mul(Math.PI * 2.0);
    const plasmaColor = colorA.add( colorB.mul(cos(palettePhase)) );

    // 5. Пост-обработка (Затемнение к краям)
    // Отсекаем края, чтобы ядро светилось в центре и уходило в темноту
    const vignette = vec3(1.0).sub(distToCenter.mul(1.8));
    const finalColor = plasmaColor.mul(vignette);

    // Назначаем цвет в материал
    mat.colorNode = finalColor;

    return mat;
  }, []);

  return (
    // Используем плоскую геометрию на весь экран.
    // Фрагментному шейдеру не нужна плотная сетка (как в VertexLab),
    // ему достаточно всего 2-х треугольников (1x1 сегмент).
    <mesh ref={meshRef}>
      <planeGeometry args={[15, 15, 1, 1]} />
      <primitive object={materialNode} attach="material" />
    </mesh>
  );
};