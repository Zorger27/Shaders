import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';

// Автоматически подстроит камеру под радиус сферы!!!

export default function FitCamera({ radius }) {
  const { camera } = useThree();

  useLayoutEffect(() => {
    // Формула: расстояние = радиус / sin(FOV / 2)
    // Добавляем коэффициент 1.5 - 2.0, чтобы объект не "прилипал" к краям экрана
    const fov = camera.fov;
    const distance = radius / Math.sin((fov * Math.PI) / 360) * 1.5;

    // Устанавливаем камеру под углом 45 градусов, чтобы было красиво
    camera.position.set(distance, distance, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [radius, camera]);

  return null; // Ничего не рендерит, только управляет камерой
}