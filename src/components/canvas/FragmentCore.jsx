import React, { useRef, useMemo, useEffect } from "react";
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { Fn, uv, time, uniform, vec2, vec3, cos, sin, length, smoothstep } from 'three/tsl';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const FragmentCore = ({
                               viscosity = 1.0,
                               turbulence = 1.5,
                               speed = 1.0,
                               palette
                             }) => {
  const meshRef = useRef(null);

  // Достаем размеры видимого экрана в 3D-юнитах
  const { viewport } = useThree();

  // Uniforms для мгновенной передачи параметров с UI
  const uViscosity = useMemo(() => uniform(viscosity), []);
  const uTurbulence = useMemo(() => uniform(turbulence), []);
  const uSpeed = useMemo(() => uniform(speed), []);

  // Uniform для мыши (живет только здесь)
  const uMouse = useMemo(() => uniform(new THREE.Vector2(0, 0)), []);

  // Uniforms для Палитры (A, B, C, D)
  const uColorA = useMemo(() => uniform(new THREE.Vector3()), []);
  const uColorB = useMemo(() => uniform(new THREE.Vector3()), []);
  const uColorC = useMemo(() => uniform(new THREE.Vector3()), []);
  const uColorD = useMemo(() => uniform(new THREE.Vector3()), []);

  // Создаем uniform для сохранения правильных пропорций (чтобы круги не стали овалами)
  const aspect = viewport.width / viewport.height;
  const uAspect = useMemo(() => uniform(aspect), []);

  // Обновляем параметры
  useEffect(() => { uViscosity.value = viscosity; }, [viscosity]);
  useEffect(() => { uTurbulence.value = turbulence; }, [turbulence]);
  useEffect(() => { uSpeed.value = speed; }, [speed]);

  // Мгновенно обновляем пропорции при изменении размера окна
  useEffect(() => { uAspect.value = aspect; }, [aspect]);

  // Обновляем цвета при переключении палитры
  useEffect(() => {
    if (palette) {
      uColorA.value.copy(palette.a);
      uColorB.value.copy(palette.b);
      uColorC.value.copy(palette.c);
      uColorD.value.copy(palette.d);
    }
  }, [palette]);

  // МАГИЯ R3F: Берем координаты мыши напрямую из движка каждый кадр!
  useFrame((state) => {
    // state.pointer дает значения от -1 до 1.
    // Наш шейдер работает в координатах от -0.5 до 0.5, поэтому делим на 2
    uMouse.value.set(state.pointer.x * 0.5, state.pointer.y * 0.5);
  });

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
    const mouseEffect = smoothstep(0.4, 0.0, mouseDist).mul(0.9); // Сила влияния мыши

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
    // ИСПОЛЬЗУЕМ UNIFORMS ЦВЕТОВ. Вычисляем цвет и отдаем чистый цвет плазмы на весь экран!
    const palettePhase = uColorC.mul(noiseNorm).add(uColorD).mul(Math.PI * 2.0);
    mat.colorNode = uColorA.add( uColorB.mul(cos(palettePhase)) );

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