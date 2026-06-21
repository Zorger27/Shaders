export function generateSphericalGrid(gridSize, radius) {
  const positions = [];

  // Вычисляем шаг между частицами, чтобы вся сетка уместилась в диаметр
  const step = (radius * 2) / gridSize;

  // Смещение, чтобы центр сферы находился строго в координатах (0, 0, 0)
  const offset = radius;

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {

        // Вычисляем реальные координаты узла в пространстве
        const posX = x * step - offset;
        const posY = y * step - offset;
        const posZ = z * step - offset;

        // Проверяем расстояние до центра (0,0,0) по теореме Пифагора
        // Используем квадраты расстояний (x*x + y*y + z*z) для оптимизации,
        // чтобы не вызывать тяжелую функцию квадратного корня Math.sqrt()
        const distanceSq = posX * posX + posY * posY + posZ * posZ;

        // Если точка внутри сферы - добавляем ее
        if (distanceSq <= radius * radius) {
          positions.push(posX, posY, posZ);
        }
      }
    }
  }

  // WebGPU работает с типизированными массивами, поэтому возвращаем Float32Array
  return new Float32Array(positions);
}