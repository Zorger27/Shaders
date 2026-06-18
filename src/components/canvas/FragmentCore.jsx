import React, { useRef, useMemo, useEffect } from "react";
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { Fn, uv, time, uniform, vec2, vec3, cos, sin, length, smoothstep } from 'three/tsl';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const FragmentCore = ({
                               viscosity = 1.0,
                               turbulence = 1.5,
                               speed = 1.0,
                               mouse
                             }) => {
  const meshRef = useRef(null);

  // Достаем размеры видимого экрана в 3D-юнитах
  const { viewport } = useThree();

  // Uniforms для мгновенной передачи параметров с UI
  const uViscosity = useMemo(() => uniform(viscosity), []);
  const uTurbulence = useMemo(() => uniform(turbulence), []);
  const uSpeed = useMemo(() => uniform(speed), []);

  // Создаем uniform для мыши
  const uMouse = useMemo(() => uniform(new THREE.Vector2(0, 0)), []);

  // Создаем uniform для сохранения правильных пропорций (чтобы круги не стали овалами)
  const aspect = viewport.width / viewport.height;
  const uAspect = useMemo(() => uniform(aspect), []);

  useEffect(() => { uViscosity.value = viscosity; }, [viscosity]);
  useEffect(() => { uTurbulence.value = turbulence; }, [turbulence]);
  useEffect(() => { uSpeed.value = speed; }, [speed]);

  // Обновляем uniform при изменении пропса mouse
  useEffect(() => {uMouse.value.copy(mouse);}, [mouse]);

  // Мгновенно обновляем пропорции при изменении размера окна
  useEffect(() => { uAspect.value = aspect; }, [aspect]);

  const materialNode = useMemo(() => {
    const mat = new MeshBasicNodeMaterial();
    mat.side = THREE.DoubleSide;

    // --- ФРАГМЕНТНЫЙ ШЕЙДЕР (TSL) ---

    // 1. Центрируем UV-координаты (от -0.5 до 0.5) и корректируем UV-координаты с учетом пропорций экрана (умножаем ось X на uAspect)
    // Это нужно, чтобы эффект расходился из центра экрана
    const centeredUv = uv().sub(vec2(0.5)).mul(vec2(uAspect, 1.0));

    // РЕАКЦИЯ НА МЫШЬ:
    // Считаем дистанцию до курсора
    const mouseDist = length(centeredUv.sub(uMouse));
    // Плавная зона влияния (радиус 0.4)
    const mouseEffect = smoothstep(0.4, 0.0, mouseDist).mul(0.5); // Сила влияния мыши

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
      fluidNoise(p).add(mouseEffect), // <--- МЫШЬ ДВИГАЕТ ШУМ
      fluidNoise(p.add(vec2(5.2, 1.3))).add(mouseEffect) // <-- Магия здесь: мы сдвигаем пространство в сторону мыши
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
    const noiseNorm = finalNoise.add(1.0).mul(0.5);

    // 4. Генерация цвета (Косинусные палитры Иньиго Килеса)
    // Одна красивая палитра
    const colorA = vec3(0.5, 0.5, 0.5);
    const colorB = vec3(0.5, 0.5, 0.5);
    const colorC = vec3(1.0, 1.0, 1.0);
    const colorD = vec3(0.0, 0.33, 0.67);

    // Вычисляем цвет и отдаем чистый цвет плазмы на весь экран!
    const palettePhase = colorC.mul(noiseNorm).add(colorD).mul(Math.PI * 2.0);
    mat.colorNode = colorA.add( colorB.mul(cos(palettePhase)) );

    return mat;
  }, []); // Пустой массив зависимостей, шейдер компилируется только один раз!

  return (
    // Используем плоскую геометрию на весь экран.
    <mesh ref={meshRef}>
      {/* Плоскость всегда принимает точный размер видимого окна */}
      <planeGeometry args={[viewport.width, viewport.height, 1, 1]} />
      <primitive object={materialNode} attach="material" />
    </mesh>
  );
};