import React, {useEffect, useRef, useState} from "react";
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
import FitCamera from "@/components/util/FitCamera.jsx";
import GPGPUParticles from "@/components/canvas/GPGPUParticles.jsx";
import { OrbitControls } from '@react-three/drei';
import background03 from "@/assets/CanvasFullScreen/cube3-14.webp";

export const Project3 = () => {
  const { t } = useTranslation();
  const siteUrl = import.meta.env.VITE_SITE_URL;
  useSpaCleanup();

  const canvasContainerRef = useRef(null);
  const controlsRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  // --- СОСТОЯНИЯ ДЛЯ СИМУЛЯЦИИ ЧАСТИЦ ---
  const [isExploding, setIsExploding] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false); // Состояние для мыши
  const [gravityForce, setGravityForce] = useState(0.002);
  const [friction, setFriction] = useState(0.98);
  const [explosionPower, setExplosionPower] = useState(1.5);
  const [particleColor, setParticleColor] = useState('#7300ff');

  // --- ФУНКЦИЯ СБРОСА НАСТРОЕК ---
  const handleReset = () => {
    setIsExploding(false);
    setIsInteractive(false);
    setGravityForce(0.002);
    setFriction(0.98);
    setExplosionPower(1.5);
    setParticleColor('#7300ff');
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

        <div ref={canvasContainerRef} className="canvas-wrapper">

          {/* БЛОК УПРАВЛЕНИЯ */}
          <div className="controls-container" ref={controlsRef}>
            {!isControlsOpen ? (
              <button className="open-controls-btn" onClick={() => setIsControlsOpen(true)}>
                <i className="fa fa-sliders"></i>
              </button>
            ) : (
              <div className="shader-controls">
                <button className="close-controls-btn" onClick={() => setIsControlsOpen(false)}>
                  &times;
                </button>

                <div className="control-group checkbox">
                  <label>
                    <input type="checkbox" checked={isExploding} onChange={(e) => setIsExploding(e.target.checked)} />
                    {t ('project3.exploding')}
                  </label>
                </div>

                <div className="control-group checkbox">
                  <label>
                    <input type="checkbox" checked={isInteractive} onChange={(e) => setIsInteractive(e.target.checked)} />
                    {t ('project3.reaction')}
                  </label>
                </div>

                <hr className="control-group-line" />

                <div className="control-group">
                  <label>{t ('project3.gravity')}: {gravityForce.toFixed(4)}</label>
                  <input type="range" min="0.0001" max="0.01" step="0.0001" value={gravityForce} onChange={(e) => setGravityForce(parseFloat(e.target.value))} />
                </div>

                <div className="control-group">
                  <label>{t ('project3.friction')}: {friction.toFixed(3)}</label>
                  <input type="range" min="0.90" max="0.999" step="0.001" value={friction} onChange={(e) => setFriction(parseFloat(e.target.value))} />
                </div>

                <div className="control-group">
                  <label>{t ('project3.impulse')}: {explosionPower.toFixed(1)}</label>
                  <input type="range" min="0.5" max="5.0" step="0.1" value={explosionPower} onChange={(e) => setExplosionPower(parseFloat(e.target.value))} />
                </div>

                <hr className="control-group-line" />

                <div className="control-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {t ('project3.color')}:
                    <input type="color" value={particleColor} onChange={(e) => setParticleColor(e.target.value)} style={{ cursor: 'pointer' }} />
                  </label>
                </div>

                <button className="control-group button" onClick={handleReset}>{t ('project3.reset')}</button>

              </div>
            )}
          </div>

          <WebGPUCanvas style={canvasStyle}>
            <perspectiveCamera makeDefault fov={50} />
            <FitCamera radius={2.2} />

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

            {/* ПЕРЕДАЕМ СОСТОЯНИЯ КАК PROPS */}
            <GPGPUParticles
              isExploding={isExploding}
              isInteractive={isInteractive}
              gravityForce={gravityForce}
              friction={friction}
              explosionPower={explosionPower}
              particleColor={particleColor}
            />

            <OrbitControls makeDefault target={[0, 0, 0]} enableDamping enablePan={false} enableZoom autoRotate autoRotateSpeed={2}/>
          </WebGPUCanvas>

        </div>

      </div>
    </div>
  );
};