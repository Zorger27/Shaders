import React, {useEffect, useRef, useState} from "react";
import { useTranslation } from 'react-i18next';
import '@/pages/menu/Project2.scss';
import {Link} from "react-router-dom";
import {useSpaCleanup} from "@/hooks/useSpaCleanup.js";
import ToggleFooterButton from "@/components/util/ToggleFooterButton.jsx";
import MetaTags from "@/components/seo/MetaTags.jsx";
import CanvasFullScreen from "@/components/util/CanvasFullScreen.jsx";
import { useResponsiveStyle } from "@/hooks/useResponsiveStyle";
import WebGPUCanvas from '@/components/canvas/WebGPUCanvas.jsx';
import SceneBackground from '@/components/canvas/SceneBackground.jsx';
import { FragmentCore } from "@/components/canvas/FragmentCore.jsx"
import background02 from "@/assets/CanvasFullScreen/cube3-25.webp";
import * as THREE from "three";

export const Project2 = () => {
  const { t } = useTranslation();
  const siteUrl = import.meta.env.VITE_SITE_URL;
  useSpaCleanup();

  const canvasContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [mouse, setMouse] = useState(new THREE.Vector2(0, 0));

  // Реф для контейнера меню (нужен для отслеживания кликов снаружи)
  const controlsRef = useRef(null);

  // Состояние для видимости меню
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  // Состояния лаборатории Фрагментов (состояние слайдеров)
  const [viscosity, setViscosity] = useState(1.0);     // Масштаб шума
  const [turbulence, setTurbulence] = useState(1.5);   // Сила завихрений
  const [speed, setSpeed] = useState(0.8);             // Скорость анимации

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

  // Хук для отслеживания мыши
  const handlePointerMove = (e) => {
    // Нормализуем координаты мыши от -0.5 до 0.5
    const x = (e.clientX / window.innerWidth) - 0.5;
    const y = -(e.clientY / window.innerHeight) + 0.5;
    setMouse(new THREE.Vector2(x, y));
  };

  // Логика закрытия меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Если клик был НЕ по нашему меню и меню открыто - закрываем его
      if (controlsRef.current && !controlsRef.current.contains(event.target)) {setIsControlsOpen(false);}
    };

    if (isControlsOpen) {document.addEventListener("mousedown", handleClickOutside);}

    // Очистка слушателя при размонтировании или закрытии меню
    return () => {document.removeEventListener("mousedown", handleClickOutside);};
  }, [isControlsOpen]);

  return (
    <div className="project2">

      <MetaTags
        mainTitle={t('project2.name')}
        metaTags={[
          { name: "description", content: t('project2.disc') },

          // Open Graph meta tags
          { property: "og:title", content: t('project2.name') },
          { property: "og:description", content: t('project2.disc') },
          { property: "og:image", content: `${siteUrl}/ogimage/project2.jpg` },
          { property: "og:url", content: `${siteUrl}/project2` },
          { property: "og:type", content: "website" },
          { property: "og:site_name", content: `${siteUrl}` },

          // Twitter meta tags
          { property: "twitter:title", content: t('project2.name') },
          { property: "twitter:description", content: t('project2.disc') },
          { property: "twitter:image", content: `${siteUrl}/ogimage/project2.jpg` },
          { name: "twitter:card", content: "summary_large_image" },

          // SEO-теги
          { name: "author", content: "Anatolii Zorin" },
          { name: "robots", content: "index,follow" },
        ]}
      />

      <div className="container">
        <h1><Link to="/" className="back-to-menu" title={t('extra.back')}>
          <i className="fa fa-arrow-circle-left"></i></Link>
          {t('project2.name')}

          <CanvasFullScreen canvasContainer={canvasContainerRef.current} onCanvasChange={setIsFullscreen}/>
          <ToggleFooterButton />
        </h1>
        <hr className="custom-line" />

        <div ref={canvasContainerRef} className="canvas-wrapper">

          {/* БЛОК УПРАВЛЕНИЯ */}
          <div className="controls-container" ref={controlsRef}>
            {!isControlsOpen ? (
              <button className="open-controls-btn" onClick={() => setIsControlsOpen(true)}>
                <i className="fa fa-sliders"></i>
              </button>
            ) : (
              <div className="shader-controls">
                <button className="close-controls-btn" onClick={() => setIsControlsOpen(false)}>&times;</button>

                <div className="control-group">
                  <label>Вязкость: {viscosity.toFixed(2)}</label>
                  <input type="range" min="0.2" max="3" step="0.01" value={viscosity} onChange={(e) => setViscosity(parseFloat(e.target.value))} />
                </div>

                <div className="control-group">
                  <label>Турбулентность: {turbulence.toFixed(2)}</label>
                  <input type="range" min="0" max="5" step="0.1" value={turbulence} onChange={(e) => setTurbulence(parseFloat(e.target.value))} />
                </div>

                <div className="control-group">
                  <label>Температура: {speed.toFixed(2)}</label>
                  <input type="range" min="0" max="3" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} />
                </div>
              </div>
            )}
          </div>

          <WebGPUCanvas onPointerMove={handlePointerMove} style={canvasStyle}>
            {/* Статичная перспектива. Мы смотрим прямо на плоскость */}
            <perspectiveCamera makeDefault position={[0, 0, 8]} />

            <SceneBackground imagePath={background02} enabled={isFullscreen} />

            <FragmentCore viscosity={viscosity} turbulence={turbulence} speed={speed} mouse={mouse}/>
          </WebGPUCanvas>

        </div>

      </div>
    </div>
  );
};