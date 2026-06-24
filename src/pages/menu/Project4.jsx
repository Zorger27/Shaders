import React, {useEffect, useRef, useState} from "react";
import { useTranslation } from 'react-i18next';
import '@/pages/menu/Project4.scss';
import {Link} from "react-router-dom";
import {useSpaCleanup} from "@/hooks/useSpaCleanup.js";
import ToggleFooterButton from "@/components/util/ToggleFooterButton.jsx";
import MetaTags from "@/components/seo/MetaTags.jsx";
import CanvasFullScreen from "@/components/util/CanvasFullScreen.jsx";
import { useResponsiveStyle } from "@/hooks/useResponsiveStyle";
import WebGPUCanvas from '@/components/canvas/WebGPUCanvas.jsx';
import SceneBackground from '@/components/canvas/SceneBackground.jsx';
import RaymarchingSculptor from "@/components/canvas/RaymarchingSculptor.jsx"
import { OrbitControls } from '@react-three/drei';
import background04 from "@/assets/CanvasFullScreen/cube3-21.webp";

export const Project4 = () => {
  const { t } = useTranslation();
  const siteUrl = import.meta.env.VITE_SITE_URL;
  useSpaCleanup();

  const canvasContainerRef = useRef(null);
  const controlsRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  // Состояния для Реймаршинга
  const [objectColor, setObjectColor] = useState('#691bef');
  const [morphFactor, setMorphFactor] = useState(0.3);
  const [resetKey, setResetKey] = useState(0);

  // Закрытие меню по клику вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (controlsRef.current && !controlsRef.current.contains(event.target)) {
        setIsControlsOpen(false);
      }
    };
    if (isControlsOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isControlsOpen]);

  const handleReset = () => {
    setObjectColor('#691bef');
    setMorphFactor(0.3);
    // Меняем ключ, заставляя React пересоздать компоненту с нуля
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

        <div ref={canvasContainerRef} className="canvas-wrapper">

          {/* НАСТРОЙКИ UI ИНТЕРФЕЙСА */}
          <div className="controls-container" ref={controlsRef}>
            {!isControlsOpen ? (
              <button className="open-controls-btn" onClick={() => setIsControlsOpen(true)}><i className="fa fa-sliders"></i></button>
            ) : (
              <div className="shader-controls">
                <button className="close-controls-btn" onClick={() => setIsControlsOpen(false)}>&times;</button>

                <div className="control-group">
                  <label>{t ('project4.morph')}: {morphFactor}</label>
                  <input type="range" min="0" max="1" step="0.01" value={morphFactor}
                         onChange={(e) => setMorphFactor(parseFloat(e.target.value))}
                  />
                </div>

                <hr className="control-group-line" />

                <div className="control-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {t ('project4.color')}
                    <input type="color" value={objectColor}
                           onChange={(e) => setObjectColor(e.target.value)}
                    />
                  </label>
                </div>

                <div className="control-group"><button className="reset" onClick={handleReset}>{t ('project4.reset')}</button></div>
              </div>
            )}
          </div>

          <WebGPUCanvas style={canvasStyle}>
            <perspectiveCamera makeDefault position={[0, 0, 2.5]} />
            <ambientLight intensity={0.6} />

            <SceneBackground imagePath={background04} enabled={isFullscreen}/>

            <RaymarchingSculptor
              key={resetKey}
              objectColor={objectColor}
              morphFactor={morphFactor}
            />

            <OrbitControls makeDefault target={[0, 0, 0]} enableDamping enablePan={false} enableZoom
                           // autoRotate
                           // autoRotateSpeed={2}
            />
          </WebGPUCanvas>

        </div>

      </div>
    </div>
  );
};