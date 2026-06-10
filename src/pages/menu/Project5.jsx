import React, {useEffect, useRef, useState} from "react";
import { useTranslation } from 'react-i18next';
import '@/pages/menu/Project5.scss';
import {Link} from "react-router-dom";
import {useSpaCleanup} from "@/hooks/useSpaCleanup.js";
import ToggleFooterButton from "@/components/util/ToggleFooterButton.jsx";
import MetaTags from "@/components/seo/MetaTags.jsx";
import CanvasFullScreen from "@/components/util/CanvasFullScreen.jsx";
import { useResponsiveStyle } from "@/hooks/useResponsiveStyle";
import WebGPUCanvas from '@/components/canvas/WebGPUCanvas.jsx';
import SceneBackground from '@/components/canvas/SceneBackground.jsx';

import * as THREE from "three";
import { OrbitControls } from '@react-three/drei';
import { instanceIndex, positionLocal, storage, wgslFn, color, uniform } from 'three/tsl'

import background05 from "@/assets/CanvasFullScreen/cube3-15.webp";

export const Project5 = () => {
  const { t } = useTranslation();
  const siteUrl = import.meta.env.VITE_SITE_URL;
  useSpaCleanup();
  const canvasContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Функция для перевода градусов в радианы
  const degreesToRadians = (degrees) => degrees * (Math.PI / 180);

  // Куб с прозрачными гранями и свечением по контуру
  const Box = () => {
    const meshRef = useRef(null);

    // Цвета для 6 сторон с прозрачностью - используем MeshBasicMaterial для ярких цветов
    const materials = [
      new THREE.MeshBasicMaterial({ color: 'red', transparent: true, opacity: 1 }),
      new THREE.MeshBasicMaterial({ color: 'green', transparent: true, opacity: 1 }),
      new THREE.MeshBasicMaterial({ color: 'blue', transparent: true, opacity: 1 }),
      new THREE.MeshBasicMaterial({ color: 'gold', transparent: true, opacity: 1 }),
      new THREE.MeshBasicMaterial({ color: 'purple', transparent: true, opacity: 1 }),
      new THREE.MeshBasicMaterial({ color: 'cyan', transparent: true, opacity: 1 }),
    ];

    // Устанавливаем начальный наклон куба
    useEffect(() => {
      if (meshRef.current) {
        const euler = new THREE.Euler(
          degreesToRadians(90),   // 90 градусов по X
          degreesToRadians(20),   // 20 градусов по Y
          0                            // 0° поворот по Z
        );

        meshRef.current.setRotationFromEuler(euler);
      }
    }, []);

    return (
      <group ref={meshRef}>
        <mesh geometry={new THREE.BoxGeometry(2.5, 2.5, 2.5)} material={materials} />
        {/* Белые линии по рёбрам куба */}
        <lineSegments geometry={new THREE.EdgesGeometry(new THREE.BoxGeometry(2.5,2.5,2.5))}>
          <lineBasicMaterial color="white" transparent opacity={0.8} depthTest={false} />
        </lineSegments>
      </group>
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
    <div className="project5">

      <MetaTags
        mainTitle={t('project5.name')}
        metaTags={[
          { name: "description", content: t('project5.disc') },

          // Open Graph meta tags
          { property: "og:title", content: t('project5.name') },
          { property: "og:description", content: t('project5.disc') },
          { property: "og:image", content: `${siteUrl}/ogimage/project5.jpg` },
          { property: "og:url", content: `${siteUrl}/project5` },
          { property: "og:type", content: "website" },
          { property: "og:site_name", content: `${siteUrl}` },

          // Twitter meta tags
          { property: "twitter:title", content: t('project5.name') },
          { property: "twitter:description", content: t('project5.disc') },
          { property: "twitter:image", content: `${siteUrl}/ogimage/project5.jpg` },
          { name: "twitter:card", content: "summary_large_image" },

          // SEO-теги
          { name: "author", content: "Anatolii Zorin" },
          { name: "robots", content: "index,follow" },
        ]}
      />

      <div className="container">
        <h1><Link to="/" className="back-to-menu" title={t('extra.back')}>
          <i className="fa fa-arrow-circle-left"></i></Link>
          {t('project5.name')}

          <CanvasFullScreen canvasContainer={canvasContainerRef.current} onCanvasChange={setIsFullscreen}/>
          <ToggleFooterButton />
        </h1>
        <hr className="custom-line" />

        <div ref={canvasContainerRef}>

          <WebGPUCanvas style={canvasStyle}>
            <perspectiveCamera makeDefault position={[0, 0, 2.5]} />
            <ambientLight intensity={0.6} />

            <SceneBackground imagePath={background05} enabled={isFullscreen}/>

            <Box />
            <OrbitControls enableDamping enablePan={false} enableZoom autoRotate autoRotateSpeed={5}/>
          </WebGPUCanvas>

        </div>

      </div>
    </div>
  );
};