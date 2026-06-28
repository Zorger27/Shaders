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
  const morphDirRef = useRef(1); // 1 = вправо (к конусу), -1 = влево (к сфере)

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  // Состояния для Реймаршинга
  const [colorSphere, setColorSphere] = useState('#691bef');     // Фиолетовый (Сфера)
  const [colorTorus, setColorTorus] = useState('#00f2ff');       // Циан (Тор)
  const [colorCylinder, setColorCylinder] = useState('#ff007f'); // Розовый (Цилиндр)
  const [colorCone, setColorCone] = useState('#ffd700');         // Золотой (Конус)
  const [morphFactor, setMorphFactor] = useState(0);
  const [autoMorph, setAutoMorph] = useState(false);
  const [fractalChaos, setFractalChaos] = useState(0.2);
  const [twistFactor, setTwistFactor] = useState(1.5);
  const [autoRotate, setAutoRotate] = useState(false);
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

  // Бесконечный цикл Автоморфинга (Маятник 0 -> 3 -> 0)
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const loop = (time) => {
      if (autoMorph) {
        const delta = time - lastTime;
        lastTime = time;
        const speed = 0.0001;

        setMorphFactor((prev) => {
          // Умножаем скорость на текущее направление (1 или -1)
          let next = prev + (delta * speed * morphDirRef.current);

          // Если уперлись в Конус (3), меняем направление на обратное
          if (next >= 3.0) {
            next = 3.0;
            morphDirRef.current = -1;
          }
          // Если вернулись в Сферу (0), снова идем вперед
          else if (next <= 0.0) {
            next = 0.0;
            morphDirRef.current = 1;
          }
          return next;
        });
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    if (autoMorph) {
      animationFrameId = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [autoMorph]);

  const handleReset = () => {
    setColorSphere('#691bef');
    setColorTorus('#00f2ff');
    setColorCylinder('#ff007f');
    setColorCone('#ffd700');
    setMorphFactor(0);
    morphDirRef.current = 1;
    setAutoMorph(false);  // Автоморфинг при ресете
    setFractalChaos(0.2);
    setTwistFactor(1.5);
    setAutoRotate(false);
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
                  {/* Кнопка АВТОМОРФИНГ */}
                  <button
                    className={`auto-morph-btn ${autoMorph ? 'active' : ''}`}
                    onClick={() => setAutoMorph(!autoMorph)}
                  >
                    <i className="fa-solid fa-wand-magic-sparkles"></i> {t('project4.autoMorph')}
                  </button>

                  <label>{t('project4.morph')}: {morphFactor.toFixed(2)}</label>

                  <div className="slider-wrapper">

                    {/* Кнопка МИНУС: перемещает к предыдущей целой фигуре */}
                    <button
                      className="slider-button minus"
                      title={t("extra.decrease")}
                      onClick={() => {
                        setAutoMorph(false); // Отключаем цикл при ручном клике
                        setMorphFactor(prev => Math.max(0, Math.ceil(prev) - 1));
                      }}
                      disabled={morphFactor <= 0}
                    >
                      <i className="fa-solid fa-minus-circle" />
                    </button>

                    <input type="range" min="0" max="3" step="0.01" value={morphFactor}
                           onChange={(e) => {
                             setAutoMorph(false);
                             setMorphFactor(parseFloat(e.target.value));
                           }}
                    />

                    {/* Кнопка ПЛЮС: перемещает к следующей целой фигуре */}
                    <button
                      className="slider-button plus"
                      title={t("extra.increase")}
                      onClick={() => {
                        setAutoMorph(false); // Отключаем цикл при ручном клике
                        setMorphFactor(prev => Math.min(3, Math.floor(prev) + 1));
                      }}
                      disabled={morphFactor >= 3}
                    >
                      <i className="fa-solid fa-plus-circle" />
                    </button>

                  </div>

                </div>

                <div className="control-group">
                  <label>{t('project4.chaos')}: {fractalChaos.toFixed(2)}</label>
                  <div className="slider-wrapper">

                    <button
                      className="slider-button minus"
                      title={t("extra.decrease")}
                      onClick={() => setFractalChaos(prev => {
                        const val = Math.round(prev * 100); // например, 35
                        // ceil(3.5)*10 - 10 = 4*10 - 10 = 30 -> 0.30
                        return Math.max(0, (Math.ceil(val / 10) * 10 - 10) / 100);
                      })}
                      disabled={fractalChaos <= 0}
                    >
                      <i className="fa-solid fa-minus-circle" />
                    </button>

                    <input type="range" min="0" max="1" step="0.01" value={fractalChaos}
                           onChange={(e) => setFractalChaos(parseFloat(e.target.value))}
                    />

                    <button
                      className="slider-button plus"
                      title={t("extra.increase")}
                      onClick={() => setFractalChaos(prev => {
                        const val = Math.round(prev * 100); // например, 35
                        // floor(3.5)*10 + 10 = 3*10 + 10 = 40 -> 0.40
                        return Math.min(1, (Math.floor(val / 10) * 10 + 10) / 100);
                      })}
                      disabled={fractalChaos >= 1}
                    >
                      <i className="fa-solid fa-plus-circle" />
                    </button>

                  </div>
                </div>

                <div className="control-group">
                  <label>{t('project4.twist')}: {twistFactor.toFixed(2)}</label>
                  <div className="slider-wrapper">
                    <button
                      className="slider-button minus"
                      title={t("extra.decrease")}
                      onClick={() => setTwistFactor(prev => {
                        const val = Math.round(prev * 100);
                        return Math.max(-3, (Math.ceil(val / 10) * 10 - 10) / 100);
                      })}
                      disabled={twistFactor <= -3}
                    >
                      <i className="fa-solid fa-minus-circle" />
                    </button>

                    <input
                      type="range" min="-3" max="3" step="0.01" value={twistFactor}
                      onChange={(e) => setTwistFactor(parseFloat(e.target.value))}
                    />

                    <button
                      className="slider-button plus"
                      title={t("extra.increase")}
                      onClick={() => setTwistFactor(prev => {
                        const val = Math.round(prev * 100);
                        return Math.min(3, (Math.floor(val / 10) * 10 + 10) / 100);
                      })}
                      disabled={twistFactor >= 3}
                    >
                      <i className="fa-solid fa-plus-circle" />
                    </button>
                  </div>
                </div>

                <hr className="control-group-line" />

                <div className="control-group">
                  <label>{t('project4.shapeColors')}</label>
                  <div className="colors">
                    <input type="color" value={colorSphere} onChange={(e) => setColorSphere(e.target.value)} title={t("project4.sphere")}/>
                    <input type="color" value={colorTorus} onChange={(e) => setColorTorus(e.target.value)} title={t("project4.torus")}/>
                    <input type="color" value={colorCylinder} onChange={(e) => setColorCylinder(e.target.value)} title={t("project4.cylinder")}/>
                    <input type="color" value={colorCone} onChange={(e) => setColorCone(e.target.value)} title={t("project4.cone")}/>
                  </div>
                </div>

                <div className="control-group checkbox">
                  <label>
                    <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} />
                    {t ('project4.rotate')}
                  </label>
                </div>

                <div className="control-group"><button className="reset" onClick={handleReset}>{t ('project4.reset')}</button></div>
              </div>
            )}
          </div>

          <WebGPUCanvas key={resetKey} style={canvasStyle}>
            <perspectiveCamera makeDefault position={[0, 0, 8]} />
            <ambientLight intensity={0.6} />

            <SceneBackground imagePath={background04} enabled={isFullscreen}/>

            <RaymarchingSculptor colorSphere={colorSphere}
                                 colorTorus={colorTorus}
                                 colorCylinder={colorCylinder}
                                 colorCone={colorCone}
                                 morphFactor={morphFactor}
                                 fractalChaos={fractalChaos}
                                 twistFactor={twistFactor}
            />

            <OrbitControls makeDefault target={[0, 0, 0]} enableDamping enablePan={false} enableZoom autoRotate={autoRotate} autoRotateSpeed={2}/>
          </WebGPUCanvas>

        </div>

      </div>
    </div>
  );
};