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
import {Stats} from "@react-three/drei";

// МАТЕМАТИЧЕСКИЕ ПАЛИТРЫ (Иньиго Килес)
const PALETTES = {
  corona: {
    id: 'corona',
    nameKey: 'project2.corona',
    a: new THREE.Vector3(0.5, 0.5, 0.5),
    b: new THREE.Vector3(0.5, 0.5, 0.5),
    c: new THREE.Vector3(1.0, 1.0, 1.0),
    d: new THREE.Vector3(0.0, 0.33, 0.67), // Янтарно-синий
  },
  cyber: {
    id: 'cyber',
    nameKey: 'project2.cyber',
    a: new THREE.Vector3(0.5, 0.5, 0.5),
    b: new THREE.Vector3(0.5, 0.5, 0.5),
    c: new THREE.Vector3(1.0, 1.0, 1.0),
    d: new THREE.Vector3(0.8, 0.9, 0.3), // Кислотно-зеленый и пурпурный
  },
  dark: {
    id: 'dark',
    nameKey: 'project2.dark',
    a: new THREE.Vector3(0.1, 0.1, 0.1), // Очень темная база
    b: new THREE.Vector3(0.2, 0.2, 0.2), // Низкий контраст
    c: new THREE.Vector3(2.0, 1.0, 1.0), // Резкие переходы
    d: new THREE.Vector3(0.5, 0.0, 0.1), // Кроваво-красный / Глубокий бордовый
  }
};

export const Project2 = () => {
  const { t } = useTranslation();
  const siteUrl = import.meta.env.VITE_SITE_URL;
  useSpaCleanup();

  const canvasContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Реф для контейнера меню (нужен для отслеживания кликов снаружи)
  const controlsRef = useRef(null);

  // Состояние для видимости меню
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  // Состояния лаборатории Фрагментов (состояние слайдеров)
  const [viscosity, setViscosity] = useState(1.0);     // Масштаб шума
  const [turbulence, setTurbulence] = useState(1.5);   // Сила завихрений
  const [speed, setSpeed] = useState(0.8);             // Скорость анимации
  const [currentPalette, setCurrentPalette] = useState(PALETTES.corona); // Состояние текущей палитры (по умолчанию 'corona')

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

  // --- ФУНКЦИЯ СБРОСА НАСТРОЕК ---
  const handleReset = () => {
    setViscosity(1.0);
    setTurbulence(1.5);
    setSpeed(0.8);
    setCurrentPalette(PALETTES.corona);
    setResetKey(prev => prev + 1);
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

                {/* БЛОК: Выбор состояния материи */}
                <div className="control-group palette-selector">
                  <label>{t ('project2.palette')}:</label>
                  <div className="palette-buttons">
                    {Object.values(PALETTES).map((pal) => (
                      <button
                        key={pal.id}
                        onClick={() => setCurrentPalette(pal)}
                        // Если палитра активна, добавляем класс 'active'
                        className={currentPalette.id === pal.id ? 'active' : ''}
                      >
                        {t(pal.nameKey)} {/* <-- ПЕРЕВОД ПРОИСХОДИТ ЗДЕСЬ */}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="control-group-line" />

                <div className="control-group">
                  <label>{t ('project2.viscosity')}: {viscosity.toFixed(2)}</label>
                  <input type="range" min="0.2" max="3" step="0.01" value={viscosity} onChange={(e) => setViscosity(parseFloat(e.target.value))} />
                </div>

                <div className="control-group">
                  <label>{t ('project2.turbulence')}: {turbulence.toFixed(2)}</label>
                  <input type="range" min="0" max="5" step="0.1" value={turbulence} onChange={(e) => setTurbulence(parseFloat(e.target.value))} />
                </div>

                <div className="control-group">
                  <label>{t ('project2.speed')}: {speed.toFixed(2)}</label>
                  <input type="range" min="0" max="3" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} />
                </div>

                <hr className="control-group-line" />

                <div className="control-group">
                  <button className="reset" onClick={handleReset}><i className="fa-solid fa-rotate-left"></i> {t ('extra.reset')}</button>
                </div>
              </div>
            )}
          </div>

          <WebGPUCanvas style={canvasStyle} key={resetKey}>
            {import.meta.env.DEV && <Stats className="fps-counter-bottom" />} {/* <--- Счетчик появится в левом нижнем углу экрана */}

            {/* Статичная перспектива. Мы смотрим прямо на плоскость */}
            <perspectiveCamera makeDefault position={[0, 0, 8]} />

            <SceneBackground imagePath={background02} enabled={isFullscreen} />

            <FragmentCore viscosity={viscosity} turbulence={turbulence} speed={speed} palette={currentPalette}/>
          </WebGPUCanvas>

        </div>

      </div>
    </div>
  );
};