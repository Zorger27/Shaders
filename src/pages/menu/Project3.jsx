import React, { useRef, useState, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import '@/pages/menu/Project3.scss';
import { Link } from "react-router-dom";
import { useSpaCleanup } from "@/hooks/useSpaCleanup.js";
import ToggleFooterButton from "@/components/util/ToggleFooterButton.jsx";
import MetaTags from "@/components/seo/MetaTags.jsx";
import CanvasFullScreen from "@/components/util/CanvasFullScreen.jsx";
import { useResponsiveStyle } from "@/hooks/useResponsiveStyle";
import WebGPUCanvas from '@/components/canvas/WebGPUCanvas.jsx';
import SceneBackground from '@/components/canvas/SceneBackground.jsx';

// import * as THREE from "three";
import { MeshPhysicalNodeMaterial } from 'three/webgpu';
import { OrbitControls } from '@react-three/drei';
import { useFrame } from "@react-three/fiber";

// Импортируем только необходимые математические узлы TSL
import {
  instanceIndex,
  positionLocal,
  float,
  vec3,
  mod,
  floor
} from 'three/tsl';

import background03 from "@/assets/CanvasFullScreen/cube3-14.webp";

export const Project3 = () => {
  const { t } = useTranslation();
  const siteUrl = import.meta.env.VITE_SITE_URL;
  useSpaCleanup();
  const canvasContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Компонент куба на чистом TSL
  const TslGridCube = () => {
    const gridSize = 4;
    const count = gridSize * gridSize * gridSize;
    const meshRef = useRef(null);

    const materialNode = useMemo(() => {
      // 1. Создаем материал, который поддерживает узловую (Node) логику TSL
      const mat = new MeshPhysicalNodeMaterial();

      // 2. Конвертируем размер сетки (10) в тип float для вычислений на видеокарте
      const sizeF = float(gridSize);

      // 3. Получаем уникальный номер текущего кубика (от 0 до 999) и делаем его float
      const indexF = float(instanceIndex);

      // --- РАСЧЕТ КООРДИНАТ (X, Y, Z) ДЛЯ СЕТКИ ---

      // 4. Считаем X: берем остаток от деления индекса кубика на ширину сетки (x = index % 10)
      const x = mod(indexF, sizeF);

      // 5. Считаем Y: делим индекс на 10, берем целую часть, затем остаток от деления на 10
      const y = mod(floor(indexF.div(sizeF)), sizeF);

      // 6. Считаем Z: делим индекс на 100 (10 * 10) и берем целую часть
      const z = floor(indexF.div(sizeF.mul(sizeF)));

      // --- ЦЕНТРИРОВАНИЕ И РАССТАНОВКА ---

      // 7. Сдвиг для центрирования всего большого куба: (10 * 0.5) - 0.5 = 4.5
      const centerOffset = sizeF.mul(0.5).sub(0.5);

      // 8. Задаем расстояние (промежуток) между центрами маленьких кубиков
      const spacing = float(0.8);

      // 9. Собираем 3D-вектор смещения: вычитаем центр и умножаем на расстояние
      const instanceOffset = vec3(
        x.sub(centerOffset),
        y.sub(centerOffset),
        z.sub(centerOffset)
      ).mul(spacing);

      // --- ПРИМЕНЕНИЕ ПОЗИЦИИ ---

      // 10. Итоговая позиция вершины = её локальная позиция + смещение конкретного кубика
      mat.positionNode = positionLocal.add(instanceOffset);

      // --- РАСЧЕТ ЦВЕТА (СИНЕ-ЗЕЛЕНО-КРАСНЫЙ) ---

      // 11. Нормализуем координаты от 0 до 1 (делим текущую координату на размер сетки)
      const r = x.div(sizeF); // Красный канал (Red) привязан к оси X
      const g = y.div(sizeF); // Зеленый канал (Green) привязан к оси Y
      const b = z.div(sizeF); // Синий канал (Blue) привязан к оси Z

      // 12. Передаем собранный RGB-вектор напрямую в ноду цвета материала
      mat.colorNode = vec3(r, g, b);

      // --- ЭФФЕКТ ЦВЕТНОГО СТЕКЛА ---

      // Обязательно включаем поддержку прозрачности
      mat.transparent = true;

      // transmission: от 0 (непрозрачное) до 1 (полностью пропускает свет как стекло)
      mat.transmission = 0.2;

      // opacity оставляем 1, так как прозрачностью теперь управляет transmission
      mat.opacity = 1.0;

      // Стекло должно быть гладким, чтобы красиво ловить блики от прожектора
      mat.roughness = 0.05;

      // Стекло — это диэлектрик, поэтому металличность строго 0
      mat.metalness = 0.0;

      // IOR (Индекс преломления): 1.5 — это физически корректное значение для обычного стекла
      mat.ior = 1.5;

      // thickness (толщина): добавляет объем преломлениям, чтобы кубики не казались плоской пленкой
      mat.thickness = 0.1;

      return mat;
    }, []);

    useFrame((state) => {
      if (meshRef.current) {
        meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      }
    });

    return (
      <instancedMesh ref={meshRef} args={[null, null, count]} scale={1}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <primitive object={materialNode} attach="material" />
      </instancedMesh>
    );
  };

  // responsive inline-стили
  const canvasStyle = useResponsiveStyle({
    default: {
      height: 'calc(100vh - 225px)',
      width: '100%',
      marginTop: '0rem',
      marginLeft: '0rem',
    },
    "1020": {
      height: 'calc(100vh - 218px)',
      width: '100%',
      marginTop: '0rem',
      marginLeft: '0rem',
    },
    "768": {
      height: 'calc(100vh - 206px)',
      width: '100%',
      marginTop: '0rem',
      marginLeft: '0rem',
    }
  });

  return (
    <div className="project3">

      <MetaTags
        mainTitle={t('project3.name')}
        metaTags={[
          { name: "description", content: t('project3.disc') },

          // Open Graph meta tags
          { property: "og:title", content: t('project3.name') },
          { property: "og:description", content: t('project3.disc') },
          { property: "og:image", content: `${siteUrl}/ogimage/project3.jpg` },
          { property: "og:url", content: `${siteUrl}/project3` },
          { property: "og:type", content: "website" },
          { property: "og:site_name", content: `${siteUrl}` },

          // Twitter meta tags
          { property: "twitter:title", content: t('project3.name') },
          { property: "twitter:description", content: t('project3.disc') },
          { property: "twitter:image", content: `${siteUrl}/ogimage/project3.jpg` },
          { name: "twitter:card", content: "summary_large_image" },

          // SEO-теги
          { name: "author", content: "Anatolii Zorin" },
          { name: "robots", content: "index,follow" },
        ]}
      />

      <div className="container">
        <h1><Link to="/" className="back-to-menu" title={t('extra.back')}>
          <i className="fa fa-arrow-circle-left"></i></Link>
          {t('project3.name')}

          <CanvasFullScreen canvasContainer={canvasContainerRef.current} onCanvasChange={setIsFullscreen}/>
          <ToggleFooterButton />
        </h1>
        <hr className="custom-line" />

        <div ref={canvasContainerRef}>

          <WebGPUCanvas style={canvasStyle}>
            <perspectiveCamera makeDefault position={[0, 0, 4.5]} />

            <ambientLight intensity={0.7} /> {/* Небольшой общий свет, чтобы тени не были абсолютно черными */}

            {/* Четко закрепленный прожектор */}
            <spotLight
              position={[3, 3, 1.5]} // Координаты: X (вправо), Y (вверх), Z (ближе к экрану)
              angle={0.8}            // Ширина светового конуса (в радианах). Чем меньше, тем уже луч
              penumbra={0.3}         // Степень размытия краев светового пятна (от 0 — жесткие края, до 1 — мягкие)
              intensity={55}         // Интенсивность (для spotLight значения нужны выше, чем для directional)
              decay={1.2}            // Естественное затухание света в зависимости от расстояния
            />

            <SceneBackground imagePath={background03} enabled={isFullscreen}/>

            <TslGridCube />

            <OrbitControls enableDamping enablePan={false} enableZoom autoRotate autoRotateSpeed={2}/>
          </WebGPUCanvas>

        </div>

      </div>
    </div>
  );
};