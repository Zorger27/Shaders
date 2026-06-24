import { Fn, vec3, float, length, mix, clamp, max } from 'three/tsl';

// 1. SDF Сферы: длина вектора позиции минус радиус
export const sdfSphere = Fn(([p, r]) => {
  return length(p).sub(r);
});

// 2. SDF Тора (бублика)
export const sdfTorus = Fn(([p, t]) => {
  const q = vec3(length(p.xz).sub(t.x), p.y, 0.0);
  return length(q).sub(t.y);
});

// 3. Магия слияния ртути (Smooth Minimum) - Позволяет двум SDF плавно перетекать друг в друга
export const smin = Fn(([a, b, k]) => {
  const h = clamp(float(0.5).add(float(0.5).mul(b.sub(a)).div(k)), 0.0, 1.0);
  return mix(b, a, h).sub(k.mul(h).mul(float(1.0).sub(h)));
});

// 4. SDF Куба (Параллелепипеда)
export const sdfBox = Fn(([p, b]) => {
  return length(max(vec3(p).abs().sub(b), 0.0)); // Упрощенный вариант без внутренних областей, идеален для реймершинга
});