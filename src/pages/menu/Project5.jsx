import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import '@/pages/menu/Project5.scss';
import { Link } from "react-router-dom";
import { useSpaCleanup } from "@/hooks/useSpaCleanup.js";
import ToggleFooterButton from "@/components/util/ToggleFooterButton.jsx";
import MetaTags from "@/components/seo/MetaTags.jsx";
import CanvasFullScreen from "@/components/util/CanvasFullScreen.jsx";
import { useResponsiveStyle } from "@/hooks/useResponsiveStyle";
import WebGPUCanvas from '@/components/canvas/WebGPUCanvas.jsx';
import SceneBackground from '@/components/canvas/SceneBackground.jsx';
import { TslGridCube } from '@/components/canvas/TslGridCube.jsx';
import { OrbitControls, Stats } from '@react-three/drei';
import background05 from "@/assets/CanvasFullScreen/cube3-15.webp";

export const Project5 = () => {
  const { t } = useTranslation();
  const siteUrl = import.meta.env.VITE_SITE_URL;
  useSpaCleanup();

  const canvasContainerRef = useRef(null);
  const controlsRef = useRef(null);
  // Реф для направления маятника (1 = вправо, -1 = влево)
  const sizeDirRef = useRef(1);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // --- СОСТОЯНИЯ УПРАВЛЕНИЯ ---
  const [gridSize, setGridSize] = useState(7.0);
  const [autoSize, setAutoSize] = useState(false);
  const [density, setDensity] = useState(1.0);     // Плотность от 1.0 до 5.0
  const [roughness, setRoughness] = useState(0.1); // Шероховатость от 0.0 до 1.0
  const [metalness, setMetalness] = useState(0.9); // Металличность от 0.0 до 1.0

  // Цвета осей (по дефолту: Черный, Ярко-фиолетовый, Золотой)
  const [colorX, setColorX] = useState('#000000');
  const [colorY, setColorY] = useState('#aa00ff');
  const [colorZ, setColorZ] = useState('#ffd700');

  // Чекбоксы вращения
  const [rotateObject, setRotateObject] = useState(false);
  const [rotateScene, setRotateScene] = useState(true);

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

  // Бесконечный цикл Авторазмера (Маятник 5 -> 25 -> 5)
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const loop = (time) => {
      if (autoSize) {
        const delta = time - lastTime;
        lastTime = time;
        const speed = 0.001; // Скорость маятника

        setGridSize((prev) => {
          let next = prev + (delta * speed * sizeDirRef.current);
          if (next >= 25.0) {
            next = 25.0;
            sizeDirRef.current = -1;
          } else if (next <= 5.0) {
            next = 5.0;
            sizeDirRef.current = 1;
          }
          return next;
        });
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    if (autoSize) animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [autoSize]);

  const handleReset = () => {
    setGridSize(7.0);
    setAutoSize(false);
    setDensity(1.0);
    setRoughness(0.1);
    setMetalness(0.9);
    setColorX('#000000');
    setColorY('#aa00ff');
    setColorZ('#ffd700');
    setRotateObject(false);
    setRotateScene(true);

    sizeDirRef.current = 1;
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

        <div ref={canvasContainerRef} className="canvas-wrapper">

          {/* НАСТРОЙКИ UI ИНТЕРФЕЙСА */}
          <div className="controls-container" ref={controlsRef}>
            {!isControlsOpen ? (
              <button className="open-controls-btn" onClick={() => setIsControlsOpen(true)}><i className="fa fa-sliders"></i></button>
            ) : (
              <div className="shader-controls">
                <button className="close-controls-btn" onClick={() => setIsControlsOpen(false)}>&times;</button>

                {/* Авторазмер и Ползунок размерности */}
                <div className="control-group">
                {/* Авторазмер */}
                <button
                  className={`auto-morph-btn ${autoSize ? 'active' : ''}`}
                  onClick={() => setAutoSize(!autoSize)}
                >
                  <i className="fa-solid fa-up-right-and-down-left-from-center"></i> {t('project5.autoSize')}
                </button>

                {/* Ползунок размерности (5 - 25) */}
                  <label>{t('project5.dimension') || 'Размерность'}: {gridSize.toFixed(1)}</label>

                  <div className="slider-wrapper">
                    <button
                      className="slider-button minus"
                      title={t("extra.decrease")}
                      onClick={() => {
                        setAutoSize(false);
                        setGridSize(prev => Math.max(5, Math.floor((prev - 0.1) / 5) * 5));
                      }}
                      disabled={gridSize <= 5}
                    >
                      <i className="fa-solid fa-minus-circle" />
                    </button>

                    <input
                      type="range" min="5" max="25" step="0.01" value={gridSize}
                      onChange={(e) => {
                        setAutoSize(false);
                        setGridSize(parseFloat(e.target.value));
                      }}
                    />

                    <button
                      className="slider-button plus"
                      title={t("extra.increase")}
                      onClick={() => {
                        setAutoSize(false);
                        setGridSize(prev => Math.min(25, Math.ceil((prev + 0.1) / 5) * 5));
                      }}
                      disabled={gridSize >= 25}
                    >
                      <i className="fa-solid fa-plus-circle" />
                    </button>
                  </div>
                </div>

                {/* Ползунок Плотности (Разлет) */}
                <div className="control-group">
                  <label>{t('project5.density')}: {density.toFixed(1)}</label>
                  <div className="slider-wrapper">
                    <button
                      className="slider-button minus"
                      title={t("extra.decrease")}
                      onClick={() => setDensity(prev => Math.max(1, Math.round((prev - 0.1) * 10) / 10))}
                      disabled={density <= 1}
                    >
                      <i className="fa-solid fa-minus-circle" />
                    </button>
                    <input
                      type="range" min="1" max="5" step="0.1" value={density}
                      onChange={(e) => setDensity(parseFloat(e.target.value))}
                    />
                    <button
                      className="slider-button plus"
                      title={t("extra.increase")}
                      onClick={() => setDensity(prev => Math.min(5, Math.round((prev + 0.1) * 10) / 10))}
                      disabled={density >= 5}
                    >
                      <i className="fa-solid fa-plus-circle" />
                    </button>
                  </div>
                </div>

                {/* Шероховатость */}
                <div className="control-group">
                  <label>{t('project5.roughness')}: {roughness.toFixed(2)}</label>
                  <div className="slider-wrapper">
                    <button
                      className="slider-button minus"
                      title={t("extra.decrease")}
                      onClick={() => setRoughness(prev => Math.max(0, Math.round((prev - 0.01) * 100) / 100))}
                      disabled={roughness <= 0}
                    >
                      <i className="fa-solid fa-minus-circle" />
                    </button>
                    <input
                      type="range" min="0" max="1" step="0.01" value={roughness}
                      onChange={(e) => setRoughness(parseFloat(e.target.value))}
                    />
                    <button
                      className="slider-button plus"
                      title={t("extra.increase")}
                      onClick={() => setRoughness(prev => Math.min(1, Math.round((prev + 0.01) * 100) / 100))}
                      disabled={roughness >= 1}
                    >
                      <i className="fa-solid fa-plus-circle" />
                    </button>
                  </div>
                </div>

                {/* Металличность */}
                <div className="control-group">
                  <label>{t('project5.metalness')}: {metalness.toFixed(2)}</label>
                  <div className="slider-wrapper">
                    <button
                      className="slider-button minus"
                      title={t("extra.decrease")}
                      onClick={() => setMetalness(prev => Math.max(0, Math.round((prev - 0.01) * 100) / 100))}
                      disabled={metalness <= 0}
                    >
                      <i className="fa-solid fa-minus-circle" />
                    </button>
                    <input
                      type="range" min="0" max="1" step="0.01" value={metalness}
                      onChange={(e) => setMetalness(parseFloat(e.target.value))}
                    />
                    <button
                      className="slider-button plus"
                      title={t("extra.increase")}
                      onClick={() => setMetalness(prev => Math.min(1, Math.round((prev + 0.01) * 100) / 100))}
                      disabled={metalness >= 1}
                    >
                      <i className="fa-solid fa-plus-circle" />
                    </button>
                  </div>
                </div>

                <hr className="control-group-line" />

                {/* Цвета осей */}
                <div className="control-group">
                  <label>{t('project5.colors') || 'Цвета осей (X, Y, Z)'}</label>
                  <div className="colors">
                    <input type="color" value={colorX} onChange={e => setColorX(e.target.value)} title={t("project5.x-title")} />
                    <input type="color" value={colorY} onChange={e => setColorY(e.target.value)} title={t("project5.y-title")} />
                    <input type="color" value={colorZ} onChange={e => setColorZ(e.target.value)} title={t("project5.z-title")} />
                  </div>
                </div>

                {/* Чекбоксы вращения */}
                <div className="control-group checkboxes-group">
                  <label className="custom-checkbox">
                    <input type="checkbox" checked={rotateObject} onChange={e => setRotateObject(e.target.checked)} />
                    <span className="checkmark"></span>
                    {t('project5.rotateObject')}
                  </label>
                  <label className="custom-checkbox">
                    <input type="checkbox" checked={rotateScene} onChange={e => setRotateScene(e.target.checked)} />
                    <span className="checkmark"></span>
                    {t('project5.rotateScene')}
                  </label>
                </div>

                <div className="control-group">
                  <button className="reset" onClick={handleReset}><i className="fa-solid fa-rotate-left"></i> {t ('extra.reset')}</button>
                </div>

              </div>
            )}
          </div>

          <WebGPUCanvas style={canvasStyle} key={resetKey}>
            {import.meta.env.DEV && <Stats className="fps-counter-bottom" />} {/* <--- Счетчик появится в левом нижнем углу экрана */}

            <perspectiveCamera makeDefault position={[0, 0, 4.5]} />

            <ambientLight intensity={0.7} /> {/* Небольшой общий свет, чтобы тени не были абсолютно черными */}

            {/* Четко закрепленный прожектор */}
            <spotLight
              position={[3, 3, 1.5]} // Координаты: X (вправо), Y (вверх), Z (ближе к экрану)
              angle={0.7}            // Ширина светового конуса (в радианах). Чем меньше, тем уже луч
              penumbra={0.8}         // Степень размытия краев светового пятна (от 0 — жесткие края, до 1 — мягкие)
              intensity={55}         // Интенсивность (для spotLight значения нужны выше, чем для directional)
              decay={0.5}            // Естественное затухание света в зависимости от расстояния
            />

            <SceneBackground imagePath={background05} enabled={isFullscreen}/>

            <TslGridCube
              gridSize={gridSize}
              colorX={colorX} colorY={colorY} colorZ={colorZ}
              rotateObject={rotateObject}
              density={density}
              roughness={roughness}
              metalness={metalness}
            />

            <OrbitControls enableDamping enablePan={false} enableZoom autoRotate={rotateScene} autoRotateSpeed={2}/>
          </WebGPUCanvas>

        </div>

      </div>
    </div>
  );
};