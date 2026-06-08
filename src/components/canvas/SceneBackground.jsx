import React from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

// Компонент для установки фона
const SceneBackground = ({
                           imagePath,
                           enabled = true,
                         }) => {

  // Хук R3F для загрузки ресурсов three.js
  // const texture = useLoader(EXRLoader, imagePath);
  const texture = useLoader(TextureLoader, imagePath);

  // Если НЕ в fullscreen - НЕ устанавливаем фон вообще (прозрачный)
  if (!enabled) {
    return null; // Просто ничего не рендерим - фон будет прозрачным
  }

  // Возвращаем специальный элемент, который прикрепляет текстуру к фону сцены
  return (
    <primitive attach="background" object={texture}/>
  );
};

export default SceneBackground;