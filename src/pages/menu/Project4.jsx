import React, {useEffect, useRef, useState} from "react";
import { useTranslation } from 'react-i18next';
import '@/pages/menu/Project4.scss';
import {Link} from "react-router-dom";
import {useSpaCleanup} from "@/hooks/useSpaCleanup.js";
import ToggleFooterButton from "@/components/util/ToggleFooterButton.jsx";
import MetaTags from "@/components/seo/MetaTags.jsx";
import CanvasFullScreen from "@/components/util/CanvasFullScreen.jsx";
import { useResponsiveStyle } from "@/hooks/useResponsiveStyle";
import {Canvas, extend, useFrame, useThree, useLoader} from '@react-three/fiber';
import { WebGPURenderer } from 'three/webgpu';
import { TextureLoader } from 'three';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import background04 from "@/assets/CanvasFullScreen/cube3-21.webp";
import background01 from "@/assets/CanvasFullScreen/cube3-20.webp";

extend({ OrbitControls }); // Регистрируем OrbitControls в R3F

export const Project4 = () => {
  const { t } = useTranslation();
  const siteUrl = import.meta.env.VITE_SITE_URL;
  useSpaCleanup();
  const canvasContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Функция для перевода градусов в радианы
  const degreesToRadians = (degrees) => degrees * (Math.PI / 180);

  // Компонент управления камерой
  const CameraControls = () => {
    const { camera, gl } = useThree();
    const controls = useRef(null);
    useFrame(() => controls.current && controls.current.update());
    return (
      <orbitControls
        ref={controls}
        args={[camera, gl.domElement]}
        enableDamping
        enablePan={false}
        enableZoom={true}
        autoRotate={true}
        autoRotateSpeed={5}
      />
    );
  };

  // Компонент рендера
  const WebGPUCanvas = ({ children, style }) => {
    return (
      <Canvas
        style={style}
        gl={async (props) => {
          const renderer = new WebGPURenderer({canvas: props.canvas, antialias: true, alpha: true,});
          await renderer.init();
          // console.log('WebGPU INIT:', renderer);
          return renderer;
        }}
      >
        {children}
      </Canvas>
    );
  };

  // Компонент для установки фона
  function SceneBackground({ imagePath, canvasFullscreen }) {
    // Хук R3F для загрузки ресурсов three.js
    // const texture = useLoader(EXRLoader, imagePath);
    const texture = useLoader(TextureLoader, imagePath);

    // Если НЕ в fullscreen - НЕ устанавливаем фон вообще (прозрачный)
    if (!canvasFullscreen) {
      return null; // ⭐ Просто ничего не рендерим - фон будет прозрачным
    }

    // Возвращаем специальный элемент, который прикрепляет текстуру к фону сцены
    return <primitive attach="background" object={texture} />;
  }

  // Куб с прозрачными гранями и свечением по контуру
  const Box = () => {
    const meshRef = useRef(null);

    // Цвета для 6 сторон с прозрачностью - используем MeshBasicMaterial для ярких цветов
    const materials = [
      new THREE.MeshBasicMaterial({ color: 'red', transparent: true, opacity: 0.7 }),
      new THREE.MeshBasicMaterial({ color: 'green', transparent: true, opacity: 0.7 }),
      new THREE.MeshBasicMaterial({ color: 'blue', transparent: true, opacity: 0.7 }),
      new THREE.MeshBasicMaterial({ color: 'yellow', transparent: true, opacity: 0.7 }),
      new THREE.MeshBasicMaterial({ color: 'purple', transparent: true, opacity: 0.7 }),
      new THREE.MeshBasicMaterial({ color: 'cyan', transparent: true, opacity: 0.7 }),
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

  // Убеждаемся, что реально используется WebGPU
  const DebugRenderer = () => {
    const { gl } = useThree();

    useEffect(() => {
      // console.log(gl);
      console.log('Renderer:', gl.constructor.name);
      console.log('WebGPU:', gl.isWebGPURenderer);
    }, [gl]);

    return null;
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
    <div className="project4">

      <MetaTags
        mainTitle={t('project4.name')}
        metaTags={[
          { name: "description", content: t('project4.disc') },

          // Open Graph meta tags
          { property: "og:title", content: t('project4.name') },
          { property: "og:description", content: t('project4.disc') },
          { property: "og:image", content: `${siteUrl}/ogimage/project4.jpg` },
          { property: "og:url", content: `${siteUrl}/project4` },
          { property: "og:type", content: "website" },
          { property: "og:site_name", content: `${siteUrl}` },

          // Twitter meta tags
          { property: "twitter:title", content: t('project4.name') },
          { property: "twitter:description", content: t('project4.disc') },
          { property: "twitter:image", content: `${siteUrl}/ogimage/project4.jpg` },
          { name: "twitter:card", content: "summary_large_image" },

          // SEO-теги
          { name: "author", content: "Anatolii Zorin" },
          { name: "robots", content: "index,follow" },
        ]}
      />

      <div className="container">
        <h1><Link to="/" className="back-to-menu" title={t('extra.back')}>
          <i className="fa fa-arrow-circle-left"></i></Link>
          {t('project4.name')}

          <CanvasFullScreen canvasContainer={canvasContainerRef.current} onCanvasChange={setIsFullscreen}/>
          <ToggleFooterButton />
        </h1>
        <hr className="custom-line" />

        <div ref={canvasContainerRef}>

          <WebGPUCanvas style={canvasStyle}>
            <DebugRenderer />
            <perspectiveCamera makeDefault position={[0, 0, 2.5]} />
            <ambientLight intensity={0.6} />

            {/* Используем компонент с путём к картинке */}
            <SceneBackground imagePath={background04} canvasFullscreen={isFullscreen} />

            <Box />
            <CameraControls />
          </WebGPUCanvas>

        </div>

      </div>
    </div>
  );
};