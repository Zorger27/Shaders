import { vec2, vec3, float, Fn, clamp, max, min, abs, length, mix, sin } from 'three/tsl';

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

// 5. ЦИЛИНДР
export const sdfCylinder = Fn(([p, h]) => {
  // p: точка в пространстве
  // h: vec2 (x = радиус, y = половина высоты)
  const d = abs(vec2(length(p.xz), p.y)).sub(h);
  return min(max(d.x, d.y), 0.0).add(length(max(d, 0.0)));
});

// 6. КОНУС (Усеченный / Цилиндрический)
export const sdfCone = Fn(([p, r, h]) => {
  // p: точка в пространстве
  // r: радиус основания (float)
  // h: половина высоты (float)

  const q = vec2(length(p.xz), p.y);

  // Вычисляем угол наклона стенок конуса
  const angle = vec2(h.mul(2.0), r).normalize();

  // Расстояние до наклонной стенки (вершина смещена вверх на h)
  const d_side = q.x.mul(angle.x).add( q.y.sub(h).mul(angle.y) );

  // Расстояние до плоских срезов сверху и снизу (крышки конуса)
  const d_caps = abs(p.y).sub(h);

  // Возвращаем пересечение этих плоскостей (формирует конус)
  return max(d_side, d_caps);
});

// 7. Фрактальное искажение (Displacement)
export const fractalDisplacement = Fn(([p, chaos]) => {
  // Базовый масштаб узора
  const freq = float(2.5);

  // 1-я октава: крупные искажения (волны/шипы)
  const p1 = p.mul(freq);
  const d1 = sin(p1.x).mul(sin(p1.y)).mul(sin(p1.z));

  // 2-я октава: мелкие детали (умножаем частоту, уменьшаем амплитуду)
  const p2 = p.mul(freq.mul(2.3));
  const d2 = sin(p2.x).mul(sin(p2.y)).mul(sin(p2.z)).mul(0.5);

  // 3-я октава: микрорельеф
  const p3 = p.mul(freq.mul(5.1));
  const d3 = sin(p3.x).mul(sin(p3.y)).mul(sin(p3.z)).mul(0.25);

  // Складываем все слои и умножаем на силу хаоса от ползунка.
  // Коэффициент 0.4 нужен, чтобы на максимуме (1.0) фигуру не разорвало полностью
  return d1.add(d2).add(d3).mul(chaos).mul(0.4);
});