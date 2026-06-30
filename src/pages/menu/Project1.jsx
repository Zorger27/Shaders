import React, {useEffect, useRef, useState} from "react";
import { useTranslation } from 'react-i18next';
import '@/pages/menu/Project1.scss';
import {Link} from "react-router-dom";
import {useSpaCleanup} from "@/hooks/useSpaCleanup.js";
import ToggleFooterButton from "@/components/util/ToggleFooterButton.jsx";
import MetaTags from "@/components/seo/MetaTags.jsx";
import CanvasFullScreen from "@/components/util/CanvasFullScreen.jsx";
import { useResponsiveStyle } from "@/hooks/useResponsiveStyle";
import WebGPUCanvas from '@/components/canvas/WebGPUCanvas.jsx';
import SceneBackground from '@/components/canvas/SceneBackground.jsx';
import {OrbitControls, Stats} from '@react-three/drei';
import { VertexWave } from "@/components/canvas/VertexWave.jsx"
import background01 from "@/assets/CanvasFullScreen/cube3-20.webp";

export const Project1 = () => {
  const { t } = useTranslation();
  const siteUrl = import.meta.env.VITE_SITE_URL;
  useSpaCleanup();

  const canvasContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Реф для контейнера меню (нужен для отслеживания кликов снаружи)
  const controlsRef = useRef(null);

  // Состояние для видимости меню
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  // Состояние слайдеров
  const [amplitude, setAmplitude] = useState(0.9);
  const [frequency, setFrequency] = useState(1.5);
  const [speed, setSpeed] = useState(1.2);
  const [wireframe, setWireframe] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false); // Состояние для вращения сцены

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
    <div className="project1">

      <MetaTags
        mainTitle={t('project1.name')}
        metaTags={[
          { name: "description", content: t('project1.disc') },

          // Open Graph meta tags
          { property: "og:title", content: t('project1.name') },
          { property: "og:description", content: t('project1.disc') },
          { property: "og:image", content: `${siteUrl}/ogimage/project1.jpg` },
          { property: "og:url", content: `${siteUrl}/project1` },
          { property: "og:type", content: "website" },
          { property: "og:site_name", content: `${siteUrl}` },

          // Twitter meta tags
          { property: "twitter:title", content: t('project1.name') },
          { property: "twitter:description", content: t('project1.disc') },
          { property: "twitter:image", content: `${siteUrl}/ogimage/project1.jpg` },
          { name: "twitter:card", content: "summary_large_image" },

          // SEO-теги
          { name: "author", content: "Anatolii Zorin" },
          { name: "robots", content: "index,follow" },
        ]}
      />

      <div className="container">
        <h1><Link to="/" className="back-to-menu" title={t('extra.back')}>
          <i className="fa fa-arrow-circle-left"></i></Link>
          {t('project1.name')}

          <CanvasFullScreen canvasContainer={canvasContainerRef.current} onCanvasChange={setIsFullscreen}/>
          <ToggleFooterButton />
        </h1>
        <hr className="custom-line" />

        <div ref={canvasContainerRef} className="canvas-wrapper">

          {/* БЛОК УПРАВЛЕНИЯ */}
          <div className="controls-container" ref={controlsRef}>
            {!isControlsOpen ? (
              // Кнопка для открытия (показывается, когда меню скрыто)
              <button className="open-controls-btn" onClick={() => setIsControlsOpen(true)} title={t ('project1.controls-btn-title')}>
                <i className="fa fa-sliders"></i>
              </button>
            ) : (
              // Само меню (показывается, когда isControlsOpen === true)
              <div className="shader-controls">
                <button className="close-controls-btn" onClick={() => setIsControlsOpen(false)} title={t ('project1.close-title')}>
                  &times;
                </button>

                <div className="control-group">
                  <label>{t ('project1.amplitude')}: {amplitude.toFixed(2)}</label>
                  <input type="range" min="0" max="2" step="0.01" value={amplitude} onChange={(e) => setAmplitude(parseFloat(e.target.value))} />
                </div>

                <div className="control-group">
                  <label>{t ('project1.frequency')}: {frequency.toFixed(2)}</label>
                  <input type="range" min="0.1" max="5" step="0.1" value={frequency} onChange={(e) => setFrequency(parseFloat(e.target.value))} />
                </div>

                <div className="control-group">
                  <label>{t ('project1.speed')}: {speed.toFixed(2)}</label>
                  <input type="range" min="0" max="4" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} />
                </div>

                <div className="control-group checkbox">
                  <label>
                    <input type="checkbox" checked={wireframe} onChange={(e) => setWireframe(e.target.checked)} />
                    {t ('project1.wireframe')}
                  </label>
                </div>

                <div className="control-group checkbox">
                  <label>
                    <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} />
                    {t ('project1.rotate')}
                  </label>
                </div>

              </div>
            )}
          </div>

          <WebGPUCanvas style={canvasStyle}>
            {import.meta.env.DEV && <Stats className="fps-counter-bottom" />} {/* <--- Счетчик появится в левом нижнем углу экрана */}

            <perspectiveCamera makeDefault position={[8, 8, 8]} />
            <ambientLight intensity={0.5} />
            <spotLight position={[3, 3, 1.5]} angle={0.7} penumbra={1} intensity={100} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={50} color="#0044ff" />

            <SceneBackground imagePath={background01} enabled={isFullscreen} />

            <VertexWave amplitude={amplitude} frequency={frequency} speed={speed} wireframe={wireframe}/>

            <OrbitControls enableDamping enablePan={false} enableZoom autoRotate={autoRotate} autoRotateSpeed={1.5}/>
          </WebGPUCanvas>

        </div>

      </div>
    </div>
  );
};